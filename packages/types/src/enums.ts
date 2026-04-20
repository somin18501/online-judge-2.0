export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const Language = {
  C: 'C',
  CPP: 'CPP',
  PYTHON: 'PYTHON',
  JAVASCRIPT: 'JAVASCRIPT',
} as const;
export type Language = (typeof Language)[keyof typeof Language];

export const SUPPORTED_LANGUAGES: Language[] = [
  Language.C,
  Language.CPP,
  Language.PYTHON,
  Language.JAVASCRIPT,
];

export const LANGUAGE_DISPLAY: Record<Language, string> = {
  C: 'C',
  CPP: 'C++',
  PYTHON: 'Python',
  JAVASCRIPT: 'JavaScript',
};

export const SubmissionStatus = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  ACCEPTED: 'ACCEPTED',
  WRONG_ANSWER: 'WRONG_ANSWER',
  COMPILATION_ERROR: 'COMPILATION_ERROR',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  TIME_LIMIT_EXCEEDED: 'TIME_LIMIT_EXCEEDED',
  MEMORY_LIMIT_EXCEEDED: 'MEMORY_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

export const TERMINAL_SUBMISSION_STATUSES: SubmissionStatus[] = [
  SubmissionStatus.ACCEPTED,
  SubmissionStatus.WRONG_ANSWER,
  SubmissionStatus.COMPILATION_ERROR,
  SubmissionStatus.RUNTIME_ERROR,
  SubmissionStatus.TIME_LIMIT_EXCEEDED,
  SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
  SubmissionStatus.INTERNAL_ERROR,
];

export const ProblemVisibility = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;
export type ProblemVisibility = (typeof ProblemVisibility)[keyof typeof ProblemVisibility];
