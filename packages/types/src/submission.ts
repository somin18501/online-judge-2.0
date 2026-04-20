import type { Language, SubmissionStatus } from './enums';

export interface SubmissionListItem {
  id: string;
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  userId: string;
  username: string;
  language: Language;
  status: SubmissionStatus;
  runtimeMs: number | null;
  memoryKb: number | null;
  createdAt: string;
}

export interface SubmissionDetail extends SubmissionListItem {
  sourceCode: string;
  stdoutSummary: string | null;
  stderrSummary: string | null;
  errorMessage: string | null;
  passedTestCases: number | null;
  totalTestCases: number | null;
  updatedAt: string;
}

export interface CreateSubmissionInput {
  problemId: string;
  language: Language;
  sourceCode: string;
}
