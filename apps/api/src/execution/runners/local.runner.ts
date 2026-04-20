import { spawn } from 'child_process';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { Language, SubmissionStatus } from '@au/types';
import { LANGUAGE_SPECS } from '../language-spec';
import type { Runner, RunnerInput, RunnerOutput } from '../runner.interface';

const MAX_OUTPUT_BYTES = 64 * 1024;

/**
 * Development-only runner that executes code directly on the host.
 *
 * WARNING: This runner does NOT provide sandboxing/isolation. It is intended
 * strictly for local development convenience on trusted inputs. Production
 * deployments must use the DockerRunner.
 */
@Injectable()
export class LocalRunner implements Runner {
  readonly name = 'local';
  private readonly logger = new Logger(LocalRunner.name);

  async run(input: RunnerInput): Promise<RunnerOutput> {
    const spec = LANGUAGE_SPECS[input.language];
    const workdir = await mkdtemp(join(tmpdir(), 'au-judge-'));
    const sourcePath = join(workdir, spec.sourceFile);
    await writeFile(sourcePath, input.sourceCode, 'utf8');

    try {
      if (spec.compile) {
        const compileCmd = spec.compile.map((part) =>
          part.replaceAll('/workspace', workdir),
        );
        const compile = await this.spawnProcess(
          compileCmd[0]!,
          compileCmd.slice(1),
          '',
          input.timeoutMs,
        );
        if (compile.exitCode !== 0) {
          return {
            status: SubmissionStatus.COMPILATION_ERROR,
            stdout: truncate(compile.stdout),
            stderr: truncate(compile.stderr),
            runtimeMs: compile.runtimeMs,
            memoryKb: null,
            exitCode: compile.exitCode,
            timedOut: compile.timedOut,
            errorMessage: compile.timedOut ? 'Compilation timed out' : 'Compilation failed',
          };
        }
      }

      const runCmd = spec.run.map((part) => part.replaceAll('/workspace', workdir));
      const result = await this.spawnProcess(
        runCmd[0]!,
        runCmd.slice(1),
        input.stdin,
        input.timeoutMs,
      );

      if (result.timedOut) {
        return {
          status: SubmissionStatus.TIME_LIMIT_EXCEEDED,
          stdout: truncate(result.stdout),
          stderr: truncate(result.stderr),
          runtimeMs: result.runtimeMs,
          memoryKb: null,
          exitCode: result.exitCode,
          timedOut: true,
          errorMessage: 'Execution timed out',
        };
      }
      if (result.exitCode !== 0) {
        return {
          status: SubmissionStatus.RUNTIME_ERROR,
          stdout: truncate(result.stdout),
          stderr: truncate(result.stderr),
          runtimeMs: result.runtimeMs,
          memoryKb: null,
          exitCode: result.exitCode,
          timedOut: false,
          errorMessage: `Process exited with code ${result.exitCode}`,
        };
      }
      return {
        status: SubmissionStatus.ACCEPTED,
        stdout: truncate(result.stdout),
        stderr: truncate(result.stderr),
        runtimeMs: result.runtimeMs,
        memoryKb: null,
        exitCode: result.exitCode,
        timedOut: false,
        errorMessage: null,
      };
    } catch (err) {
      this.logger.error('LocalRunner error', err as Error);
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

  private spawnProcess(
    command: string,
    args: string[],
    stdin: string,
    timeoutMs: number,
  ): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
    runtimeMs: number;
    timedOut: boolean;
  }> {
    return new Promise((resolve) => {
      const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
      const start = Date.now();
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, timeoutMs);

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
          stderr: stderr + `\n[runner] ${err.message}`,
          exitCode: null,
          runtimeMs: Date.now() - start,
          timedOut,
        });
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          stdout,
          stderr,
          exitCode: code,
          runtimeMs: Date.now() - start,
          timedOut,
        });
      });

      if (stdin.length > 0) child.stdin.write(stdin);
      child.stdin.end();
    });
  }
}

function truncate(s: string): string {
  if (s.length <= MAX_OUTPUT_BYTES) return s;
  return s.slice(0, MAX_OUTPUT_BYTES) + '\n[truncated]';
}
