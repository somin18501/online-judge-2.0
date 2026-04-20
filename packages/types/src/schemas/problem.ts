import { z } from 'zod';
import { Difficulty, ProblemVisibility } from '../enums';

export const slugSchema = z
  .string()
  .trim()
  .min(3, 'Slug must be at least 3 characters')
  .max(80, 'Slug is too long')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case (lowercase letters, numbers, dashes)');

export const exampleSchema = z.object({
  input: z.string().max(4000, 'Example input is too long'),
  output: z.string().max(4000, 'Example output is too long'),
  explanation: z.string().max(2000).optional(),
});

export const testCaseSchema = z.object({
  input: z.string().max(50_000, 'Test case input is too long'),
  expectedOutput: z.string().max(50_000, 'Expected output is too long'),
  order: z.number().int().min(0).optional(),
});

export const difficultyEnum = z.nativeEnum(Difficulty);
export const visibilityEnum = z.nativeEnum(ProblemVisibility);

export const problemFormSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  slug: slugSchema.optional(),
  statement: z.string().trim().min(10, 'Statement must be at least 10 characters').max(20_000),
  constraints: z.string().trim().max(5000).optional().or(z.literal('')),
  examples: z.array(exampleSchema).max(10).default([]),
  difficulty: difficultyEnum,
  visibility: visibilityEnum.default(ProblemVisibility.PUBLISHED),
  sampleTestCases: z.array(testCaseSchema).min(1, 'At least one sample test case is required').max(10),
  hiddenTestCases: z.array(testCaseSchema).min(1, 'At least one hidden test case is required').max(50),
});
export type ProblemFormInput = z.infer<typeof problemFormSchema>;

export const problemListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  difficulty: difficultyEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['newest', 'oldest', 'title', 'difficulty']).default('newest'),
});
export type ProblemListQuery = z.infer<typeof problemListQuerySchema>;
