import { Body, Controller, Get, Param, Post, Query, UseGuards, UsePipes } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { CurrentUser, type RequestUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  Schemas,
  type Paginated,
  type SubmissionDetail,
  type SubmissionListItem,
} from '@au/types';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Post()
  @UseGuards(SessionGuard)
  @UsePipes(new ZodValidationPipe(Schemas.createSubmissionSchema))
  create(
    @Body() body: Schemas.CreateSubmissionSchemaInput,
    @CurrentUser() user: RequestUser,
  ): Promise<SubmissionListItem> {
    return this.submissions.create({
      problemId: body.problemId,
      language: body.language,
      sourceCode: body.sourceCode,
      userId: user.id,
    });
  }

  @Get()
  @UseGuards(SessionGuard)
  @UsePipes(new ZodValidationPipe(Schemas.submissionListQuerySchema, 'query'))
  list(
    @Query() query: Schemas.SubmissionListQuery,
    @CurrentUser() user: RequestUser,
  ): Promise<Paginated<SubmissionListItem>> {
    return this.submissions.list(query, { userId: user.id, role: user.role });
  }

  @Get(':id')
  @UseGuards(SessionGuard)
  getById(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<SubmissionDetail> {
    return this.submissions.getById(id, { userId: user.id, role: user.role });
  }
}
