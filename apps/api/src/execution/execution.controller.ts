import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import { RunnerFactory } from './runner.factory';
import { OptionalSessionGuard } from '../auth/guards/optional-session.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { Schemas, type RunCodeResponse } from '@au/types';

@Controller('execution')
export class ExecutionController {
  constructor(private readonly runners: RunnerFactory) {}

  @Post('run')
  @UseGuards(OptionalSessionGuard)
  @UsePipes(new ZodValidationPipe(Schemas.runCodeSchema))
  async run(@Body() body: Schemas.RunCodeSchemaInput): Promise<RunCodeResponse> {
    const runner = this.runners.get();
    const timeoutMs = body.timeoutMs ?? this.runners.timeoutMs;
    const result = await runner.run({
      language: body.language,
      sourceCode: body.sourceCode,
      stdin: body.stdin ?? '',
      timeoutMs,
      memoryMb: this.runners.memoryMb,
    });
    return {
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      runtimeMs: result.runtimeMs,
      memoryKb: result.memoryKb,
      exitCode: result.exitCode,
      timedOut: result.timedOut,
      errorMessage: result.errorMessage,
    };
  }
}
