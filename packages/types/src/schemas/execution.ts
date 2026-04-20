import { z } from 'zod';
import { languageEnum, MAX_SOURCE_CODE_BYTES } from './submission';

export const MAX_STDIN_BYTES = 20_000;

export const runCodeSchema = z.object({
  language: languageEnum,
  sourceCode: z.string().min(1).max(MAX_SOURCE_CODE_BYTES, 'Source code is too large'),
  stdin: z.string().max(MAX_STDIN_BYTES, 'stdin is too large').default(''),
  timeoutMs: z.number().int().min(100).max(10_000).optional(),
});
export type RunCodeSchemaInput = z.infer<typeof runCodeSchema>;
