import { Module } from '@nestjs/common';
import { ExecutionController } from './execution.controller';
import { RunnerFactory } from './runner.factory';
import { LocalRunner } from './runners/local.runner';
import { DockerRunner } from './runners/docker.runner';
import { JudgeService } from './judge.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ExecutionController],
  providers: [RunnerFactory, LocalRunner, DockerRunner, JudgeService],
  exports: [RunnerFactory, JudgeService],
})
export class ExecutionModule {}
