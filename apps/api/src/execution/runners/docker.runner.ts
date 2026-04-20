import { spawn } from 'child_process';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Language, SubmissionStatus } from '@au/types';
import { LANGUAGE_SPECS } from '../language-spec';
import type { Runner, RunnerInput, RunnerOutput } from '../runner.interface';
import type { AppConfig } from '../../config/env.config';

const MAX_OUTPUT_BYTES = 64 * 1024;

/**
 * Docker-based sandboxed runner.
 *
 * Safety controls applied per container invocation:
 * - `--network=none`  -> no outbound network access
 * - `--memory`        -> hard memory limit
 * - `--pids-limit`    -> prevent fork bombs
 * - `--cpus`          -> bound CPU usage
 * - `--read-only`     -> readonly root filesystem
 * - `--tmpfs /tmp`    -> scratch space for compilers
 * - `--cap-drop=ALL`  -> drop all Linux capabilities
 * - `--security-opt=no-new-privileges`
 * - host timeout with SIGKILL cleanup
 * - unique container name + `--rm` ensures cleanup
 */
@Injectable()
export class DockerRunner implements Runner {
  readonly name = 'docker';
  private readonly logger = new Logger(DockerRunner.name);

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  async run(input: RunnerInput): Promise<RunnerOutput> {
    const spec = LANGUAGE_SPECS[input.language];
    const workdir = await mkdtemp(join(tmpdir(), 'au-judge-docker-'));
    const sourcePath = join(workdir, spec.sourceFile);
    await writeFile(sourcePath, input.sourceCode, 'utf8');

    const images = this.config.get('execution', { infer: true }).dockerImages;
    const image = images[spec.dockerImageKey];

    try {
      if (spec.compile) {
        const compile = await this.runContainer({
          image,
          cmd: spec.compile,
          workdir,
          stdin: '',
          timeoutMs: Math.max(5000, input.timeoutMs * 2),
          memoryMb: input.memoryMb,
        });
        if (compile.exitCode !== 0) {
          return {
            status: SubmissionStatus.COMPILATION_ERROR,
            stdout: compile.stdout,
            stderr: compile.stderr,
            runtimeMs: compile.runtimeMs,
            memoryKb: null,
            exitCode: compile.exitCode,
            timedOut: compile.timedOut,
            errorMessage: compile.timedOut ? 'Compilation timed out' : 'Compilation failed',
          };
        }
      }

      const result = await this.runContainer({
        image,
        cmd: spec.run,
        workdir,
        stdin: input.stdin,
        timeoutMs: input.timeoutMs,
        memoryMb: input.memoryMb,
      });

      if (result.timedOut) {
        return {
          status: SubmissionStatus.TIME_LIMIT_EXCEEDED,
          stdout: result.stdout,
          stderr: result.stderr,
          runtimeMs: result.runtimeMs,
          memoryKb: null,
          exitCode: result.exitCode,
          timedOut: true,
          errorMessage: 'Execution timed out',
        };
      }
      if (result.oom) {
        return {
          status: SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
          stdout: result.stdout,
          stderr: result.stderr,
          runtimeMs: result.runtimeMs,
          memoryKb: null,
          exitCode: result.exitCode,
          timedOut: false,
          errorMessage: 'Memory limit exceeded',
        };
      }
      if (result.exitCode !== 0) {
        return {
          status: SubmissionStatus.RUNTIME_ERROR,
          stdout: result.stdout,
          stderr: result.stderr,
          runtimeMs: result.runtimeMs,
          memoryKb: null,
          exitCode: result.exitCode,
          timedOut: false,
          errorMessage: `Process exited with code ${result.exitCode}`,
        };
      }
      return {
        status: SubmissionStatus.ACCEPTED,
        stdout: result.stdout,
        stderr: result.stderr,
        runtimeMs: result.runtimeMs,
        memoryKb: null,
        exitCode: result.exitCode,
        timedOut: false,
        errorMessage: null,
      };
    } catch (err) {
      this.logger.error('DockerRunner error', err as Error);
      return {
        status: SubmissionStatus.INTERNAL_ERROR,
        stdout: '',
        stderr: err instanceof Error ? err.message : String(err),
        runtimeMs: 0,
        memoryKb: null,
        exitCode: null,
        timedOut: false,
        errorMessage: 'Internal runner error',
      };
    } finally {
      await rm(workdir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  private async runContainer(opts: {
    image: string;
    cmd: string[];
    workdir: string;
    stdin: string;
    timeoutMs: number;
    memoryMb: number;
  }): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
    runtimeMs: number;
    timedOut: boolean;
    oom: boolean;
  }> {
    const containerName = `au-judge-${randomBytes(8).toString('hex')}`;
    const dockerArgs = [
      'run',
      '--rm',
      '-i',
      '--name',
      containerName,
      '--network=none',
      '--read-only',
      '--tmpfs',
      '/tmp:rw,noexec,nosuid,size=64m',
      '--memory',
      `${opts.memoryMb}m`,
      '--memory-swap',
      `${opts.memoryMb}m`,
      '--pids-limit',
      '128',
      '--cpus',
      '1',
      '--cap-drop=ALL',
      '--security-opt=no-new-privileges',
      // Workspace is writable so compiled binaries can be written alongside
      // the source; isolation is preserved via network=none, cap-drop, tmpfs,
      // and per-run teardown.
      '-v',
      `${opts.workdir}:/workspace:rw`,
      '-w',
      '/workspace',
      opts.image,
      ...opts.cmd,
    ];

    return new Promise((resolve) => {
      const child = spawn('docker', dockerArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
      const start = Date.now();
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        spawn('docker', ['kill', containerName]);
      }, opts.timeoutMs);

      child.stdout.on('data', (chunk: Buffer) => {
        if (stdout.length < MAX_OUTPUT_BYTES) stdout += chunk.toString('utf8');
      });
      child.stderr.on('data', (chunk: Buffer) => {
        if (stderr.length < MAX_OUTPUT_BYTES) stderr += chunk.toString('utf8');
      });
      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          stdout,
          stderr: stderr + `\n[docker] ${err.message}`,
          exitCode: null,
          runtimeMs: Date.now() - start,
          timedOut,
          oom: false,
        });
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        // Docker returns 137 for OOM-killed SIGKILL containers.
        const oom = code === 137 && /killed/i.test(stderr);
        resolve({
          stdout: truncate(stdout),
          stderr: truncate(stderr),
          exitCode: code,
          runtimeMs: Date.now() - start,
          timedOut,
          oom,
        });
      });

      if (opts.stdin.length > 0) child.stdin.write(opts.stdin);
      child.stdin.end();
    });
  }
}

function truncate(s: string): string {
  if (s.length <= MAX_OUTPUT_BYTES) return s;
  return s.slice(0, MAX_OUTPUT_BYTES) + '\n[truncated]';
}
