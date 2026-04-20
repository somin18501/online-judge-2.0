import { Injectable, Logger } from '@nestjs/common';
import { Language, SubmissionStatus, type JudgeResult, type TestCaseResult } from '@au/types';
import { RunnerFactory } from './runner.factory';

export interface JudgeInput {
  language: Language;
  sourceCode: string;
  testCases: { input: string; expectedOutput: string; order: number }[];
}

@Injectable()
export class JudgeService {
  private readonly logger = new Logger(JudgeService.name);

  constructor(private readonly runners: RunnerFactory) {}

  async judge(input: JudgeInput): Promise<JudgeResult> {
    const runner = this.runners.get();
    const results: TestCaseResult[] = [];
    let totalRuntime = 0;

    for (const [i, tc] of input.testCases.entries()) {
      const result = await runner.run({
        language: input.language,
        sourceCode: input.sourceCode,
        stdin: tc.input,
        timeoutMs: this.runners.timeoutMs,
        memoryMb: this.runners.memoryMb,
      });
      totalRuntime += result.runtimeMs;

      if (result.status === SubmissionStatus.COMPILATION_ERROR) {
        return this.terminal(SubmissionStatus.COMPILATION_ERROR, {
          totalTestCases: input.testCases.length,
          passedTestCases: 0,
          runtimeMs: result.runtimeMs,
          stdoutSummary: result.stdout,
          stderrSummary: result.stderr,
          errorMessage: result.errorMessage,
          testCaseResults: results,
        });
      }

      if (result.status !== SubmissionStatus.ACCEPTED) {
        results.push({
          index: i,
          passed: false,
          status: result.status,
          runtimeMs: result.runtimeMs,
          expectedOutput: truncate(tc.expectedOutput),
          actualOutput: truncate(result.stdout),
          stderr: truncate(result.stderr),
        });
        return this.terminal(result.status, {
          totalTestCases: input.testCases.length,
          passedTestCases: i,
          runtimeMs: totalRuntime,
          stdoutSummary: truncate(result.stdout),
          stderrSummary: truncate(result.stderr),
          errorMessage: result.errorMessage,
          testCaseResults: results,
        });
      }

      const passed = normalizeOutput(result.stdout) === normalizeOutput(tc.expectedOutput);
      results.push({
        index: i,
        passed,
        status: passed ? SubmissionStatus.ACCEPTED : SubmissionStatus.WRONG_ANSWER,
        runtimeMs: result.runtimeMs,
        expectedOutput: truncate(tc.expectedOutput),
        actualOutput: truncate(result.stdout),
        stderr: truncate(result.stderr),
      });

      if (!passed) {
        return this.terminal(SubmissionStatus.WRONG_ANSWER, {
          totalTestCases: input.testCases.length,
          passedTestCases: i,
          runtimeMs: totalRuntime,
          stdoutSummary: truncate(result.stdout),
          stderrSummary: truncate(result.stderr),
          errorMessage: null,
          testCaseResults: results,
        });
      }
    }

    return this.terminal(SubmissionStatus.ACCEPTED, {
      totalTestCases: input.testCases.length,
      passedTestCases: input.testCases.length,
      runtimeMs: totalRuntime,
      stdoutSummary: '',
      stderrSummary: '',
      errorMessage: null,
      testCaseResults: results,
    });
  }

  private terminal(
    status: SubmissionStatus,
    extras: Omit<JudgeResult, 'status' | 'memoryKb'>,
  ): JudgeResult {
    return { status, memoryKb: null, ...extras };
  }
}

function normalizeOutput(value: string): string {
  return value
    .replaceAll('\r\n', '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}

function truncate(s: string, max = 4096): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + '\n[truncated]';
}
