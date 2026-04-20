import type { Language, SubmissionStatus } from '@au/types';

export interface RunnerInput {
  language: Language;
  sourceCode: string;
  stdin: string;
  timeoutMs: number;
  memoryMb: number;
}

export interface RunnerOutput {
  status: SubmissionStatus;
  stdout: string;
  stderr: string;
  runtimeMs: number;
  memoryKb: number | null;
  exitCode: number | null;
  timedOut: boolean;
  errorMessage: string | null;
}

export interface Runner {
  readonly name: 'local' | 'docker';
  run(input: RunnerInput): Promise<RunnerOutput>;
}
