import { z } from 'zod';
import { Language, SubmissionStatus } from '../enums';

export const languageEnum = z.nativeEnum(Language);
export const submissionStatusEnum = z.nativeEnum(SubmissionStatus);

export const MAX_SOURCE_CODE_BYTES = 100_000;

export const createSubmissionSchema = z.object({
  problemId: z.string().min(1, 'problemId is required'),
  language: languageEnum,
  sourceCode: z
    .string()
    .min(1, 'Source code cannot be empty')
    .max(MAX_SOURCE_CODE_BYTES, 'Source code is too large'),
});
export type CreateSubmissionSchemaInput = z.infer<typeof createSubmissionSchema>;

export const submissionListQuerySchema = z.object({
  problemId: z.string().optional(),
  userId: z.string().optional(),
  language: languageEnum.optional(),
  status: submissionStatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type SubmissionListQuery = z.infer<typeof submissionListQuerySchema>;
