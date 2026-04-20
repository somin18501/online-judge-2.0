import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

type ZodPipeTarget = 'body' | 'query' | 'param';

/**
 * Validates a single request parameter against a Zod schema.
 *
 * `@UsePipes(pipe)` applies the pipe to every handler parameter. Without the
 * target filter below, this pipe would also run against parameters decorated
 * with `@CurrentUser()` / `@Param()` / etc. and fail for shapes that don't
 * match the body/query schema. Scoping by `metadata.type` keeps the pipe
 * focused on the payload it was constructed for.
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(
    private readonly schema: ZodSchema,
    private readonly target: ZodPipeTarget = 'body',
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type !== this.target) return value;

    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException({
        message: parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        error: 'Validation failed',
        code: 'VALIDATION_FAILED',
      });
    }
    return parsed.data;
  }
}
