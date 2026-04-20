import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { CurrentUser, type RequestUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  Schemas,
  type Paginated,
  type ProblemDetail,
  type ProblemListItem,
  type SampleTestCase,
} from '@au/types';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problems: ProblemsService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(Schemas.problemListQuerySchema, 'query'))
  list(@Query() query: Schemas.ProblemListQuery): Promise<Paginated<ProblemListItem>> {
    return this.problems.list(query);
  }

  @Get('mine')
  @UseGuards(SessionGuard)
  mine(@CurrentUser() user: RequestUser): Promise<ProblemListItem[]> {
    return this.problems.listByAuthor(user.id);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string): Promise<ProblemDetail> {
    return this.problems.getBySlug(slug);
  }

  @Get('by-id/:id/edit')
  @UseGuards(SessionGuard)
  getForEdit(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<ProblemDetail & { hiddenTestCases: SampleTestCase[] }> {
    return this.problems.getByIdForAuthor(id, user.id, user.role);
  }

  @Post()
  @UseGuards(SessionGuard)
  @UsePipes(new ZodValidationPipe(Schemas.problemFormSchema))
  create(
    @Body() body: Schemas.ProblemFormInput,
    @CurrentUser() user: RequestUser,
  ): Promise<ProblemDetail> {
    return this.problems.create(body, user.id);
  }

  @Put(':id')
  @UseGuards(SessionGuard)
  @UsePipes(new ZodValidationPipe(Schemas.problemFormSchema))
  update(
    @Param('id') id: string,
    @Body() body: Schemas.ProblemFormInput,
    @CurrentUser() user: RequestUser,
  ): Promise<ProblemDetail> {
    return this.problems.update(id, body, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(SessionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser): Promise<void> {
    return this.problems.remove(id, user.id, user.role);
  }
}
