import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { AuthModule } from '../auth/auth.module';
import { ProblemsModule } from '../problems/problems.module';
import { ExecutionModule } from '../execution/execution.module';

@Module({
  imports: [AuthModule, ProblemsModule, ExecutionModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
