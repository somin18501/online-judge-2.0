import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProblemsService } from '../problems/problems.service';
import { JudgeService } from '../execution/judge.service';
import {
  Language,
  ProblemVisibility,
  Schemas,
  SubmissionStatus,
  UserRole,
  type Paginated,
  type SubmissionDetail,
  type SubmissionListItem,
} from '@au/types';
import type { Prisma } from '@prisma/client';

type SubmissionListQuery = Schemas.SubmissionListQuery;

type SubmissionWithRelations = Prisma.SubmissionGetPayload<{
  include: {
    problem: { select: { id: true; title: true; slug: true } };
    user: { select: { id: true; username: true } };
  };
}>;

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly problems: ProblemsService,
    private readonly judge: JudgeService,
  ) {}

  async create(input: {
    problemId: string;
    language: Language;
    sourceCode: string;
    userId: string;
  }): Promise<SubmissionListItem> {
    const problem = await this.prisma.problem.findUnique({ where: { id: input.problemId } });
    if (!problem || problem.visibility !== ProblemVisibility.PUBLISHED) {
      throw new NotFoundException('Problem not found');
    }

    const submission = await this.prisma.submission.create({
      data: {
        problemId: input.problemId,
        userId: input.userId,
        language: input.language,
        sourceCode: input.sourceCode,
        status: SubmissionStatus.QUEUED,
      },
      include: {
        problem: { select: { id: true, title: true, slug: true } },
        user: { select: { id: true, username: true } },
      },
    });

    // Fire-and-forget async judging. Errors are caught and logged; status is
    // persisted so the client polls /submissions/:id for progress.
    void this.processSubmission(submission.id, input.problemId).catch((err) => {
      this.logger.error(`Judging failed for submission ${submission.id}`, err as Error);
    });

    return this.toListItem(submission);
  }

  private async processSubmission(submissionId: string, problemId: string): Promise<void> {
    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.RUNNING },
    });

    const submission = await this.prisma.submission.findUnique({ where: { id: submissionId } });
    if (!submission) return;

    try {
      const testCases = await this.problems.getHiddenTestCasesForJudge(problemId);
      const result = await this.judge.judge({
        language: submission.language as Language,
        sourceCode: submission.sourceCode,
        testCases,
      });
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: result.status,
          stdoutSummary: result.stdoutSummary,
          stderrSummary: result.stderrSummary,
          errorMessage: result.errorMessage,
          runtimeMs: result.runtimeMs,
          memoryKb: result.memoryKb,
          passedTestCases: result.passedTestCases,
          totalTestCases: result.totalTestCases,
        },
      });
    } catch (err) {
      this.logger.error(`Judge error for ${submissionId}`, err as Error);
      await this.prisma.submission
        .update({
          where: { id: submissionId },
          data: {
            status: SubmissionStatus.INTERNAL_ERROR,
            errorMessage: err instanceof Error ? err.message : String(err),
          },
        })
        .catch(() => undefined);
    }
  }

  async getById(id: string, viewer: { userId: string; role: UserRole }): Promise<SubmissionDetail> {
    const row = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        problem: { select: { id: true, title: true, slug: true } },
        user: { select: { id: true, username: true } },
      },
    });
    if (!row) throw new NotFoundException('Submission not found');
    if (row.userId !== viewer.userId && viewer.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot view this submission');
    }
    return this.toDetail(row);
  }

  async list(
    query: SubmissionListQuery,
    viewer: { userId: string; role: UserRole },
  ): Promise<Paginated<SubmissionListItem>> {
    const where: Prisma.SubmissionWhereInput = {
      ...(viewer.role === UserRole.ADMIN ? {} : { userId: viewer.userId }),
      ...(query.problemId ? { problemId: query.problemId } : {}),
      ...(query.userId && viewer.role === UserRole.ADMIN ? { userId: query.userId } : {}),
      ...(query.language ? { language: query.language } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.submission.count({ where }),
      this.prisma.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          problem: { select: { id: true, title: true, slug: true } },
          user: { select: { id: true, username: true } },
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
    return {
      items: rows.map((r) => this.toListItem(r)),
      meta: {
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    };
  }

  private toListItem(row: SubmissionWithRelations): SubmissionListItem {
    return {
      id: row.id,
      problemId: row.problemId,
      problemTitle: row.problem.title,
      problemSlug: row.problem.slug,
      userId: row.userId,
      username: row.user.username,
      language: row.language as Language,
      status: row.status as SubmissionStatus,
      runtimeMs: row.runtimeMs,
      memoryKb: row.memoryKb,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private toDetail(row: SubmissionWithRelations): SubmissionDetail {
    return {
      ...this.toListItem(row),
      sourceCode: row.sourceCode,
      stdoutSummary: row.stdoutSummary,
      stderrSummary: row.stderrSummary,
      errorMessage: row.errorMessage,
      passedTestCases: row.passedTestCases,
      totalTestCases: row.totalTestCases,
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
