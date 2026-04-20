import type { Difficulty, ProblemVisibility } from './enums';

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemAuthor {
  id: string;
  username: string;
}

export interface ProblemListItem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  createdAt: string;
  author: ProblemAuthor;
}

export interface ProblemDetail extends ProblemListItem {
  statement: string;
  constraints: string | null;
  examples: ProblemExample[];
  visibility: ProblemVisibility;
  sampleTestCases: SampleTestCase[];
  updatedAt: string;
}

export interface SampleTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  order: number;
}

export interface HiddenTestCaseInput {
  input: string;
  expectedOutput: string;
  order?: number;
}

export interface SampleTestCaseInput {
  input: string;
  expectedOutput: string;
  order?: number;
}

export interface ProblemInput {
  title: string;
  slug?: string;
  statement: string;
  constraints?: string;
  examples?: ProblemExample[];
  difficulty: Difficulty;
  visibility?: ProblemVisibility;
  sampleTestCases: SampleTestCaseInput[];
  hiddenTestCases: HiddenTestCaseInput[];
}
