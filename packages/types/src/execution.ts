import type { Language, SubmissionStatus } from './enums';

export interface RunCodeInput {
  language: Language;
  sourceCode: string;
  stdin?: string;
  timeoutMs?: number;
}

export interface RunCodeResponse {
  status: SubmissionStatus;
  stdout: string;
  stderr: string;
  runtimeMs: number;
  memoryKb: number | null;
  exitCode: number | null;
  timedOut: boolean;
  errorMessage: string | null;
}

export interface TestCaseResult {
  index: number;
  passed: boolean;
  status: SubmissionStatus;
  runtimeMs: number;
  expectedOutput: string;
  actualOutput: string;
  stderr: string;
}

export interface JudgeResult {
  status: SubmissionStatus;
  totalTestCases: number;
  passedTestCases: number;
  runtimeMs: number;
  memoryKb: number | null;
  stdoutSummary: string;
  stderrSummary: string;
  errorMessage: string | null;
  testCaseResults: TestCaseResult[];
}
