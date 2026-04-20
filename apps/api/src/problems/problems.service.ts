import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';
import {
  Difficulty,
  ProblemVisibility,
  Schemas,
  UserRole,
  type Paginated,
  type ProblemDetail,
  type ProblemExample,
  type ProblemListItem,
  type SampleTestCase,
} from '@au/types';

type ProblemFormInput = Schemas.ProblemFormInput;
type ProblemListQuery = Schemas.ProblemListQuery;
import { randomSuffix, slugify } from '../common/utils/slug';

type ProblemWithAuthor = Prisma.ProblemGetPayload<{
  include: { createdBy: { select: { id: true; username: true } } };
}>;

type ProblemWithAuthorAndCases = Prisma.ProblemGetPayload<{
  include: {
    createdBy: { select: { id: true; username: true } };
    testCases: true;
  };
}>;

@Injectable()
export class ProblemsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ProblemListQuery): Promise<Paginated<ProblemListItem>> {
    const where: Prisma.ProblemWhereInput = {
      visibility: ProblemVisibility.PUBLISHED,
      ...(query.difficulty ? { difficulty: query.difficulty } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q } },
              { slug: { contains: query.q } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.ProblemOrderByWithRelationInput = (() => {
      switch (query.sort) {
        case 'oldest':
          return { createdAt: 'asc' };
        case 'title':
          return { title: 'asc' };
        case 'difficulty':
          return { difficulty: 'asc' };
        case 'newest':
        default:
          return { createdAt: 'desc' };
      }
    })();

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.problem.count({ where }),
      this.prisma.problem.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { createdBy: { select: { id: true, username: true } } },
      }),
    ]);

    return {
      items: rows.map((r) => this.toListItem(r)),
      meta: this.buildMeta(total, query.page, query.pageSize),
    };
  }

  async getBySlug(slug: string): Promise<ProblemDetail> {
    const problem = await this.prisma.problem.findUnique({
      where: { slug },
      include: {
        createdBy: { select: { id: true, username: true } },
        testCases: { orderBy: { order: 'asc' } },
      },
    });
    if (!problem) throw new NotFoundException('Problem not found');
    if (problem.visibility !== ProblemVisibility.PUBLISHED) {
      throw new NotFoundException('Problem not found');
    }
    return this.toDetail(problem, { includeHidden: false });
  }

  async getByIdForAuthor(
    id: string,
    userId: string,
    role: UserRole,
  ): Promise<ProblemDetail & { hiddenTestCases: SampleTestCase[] }> {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, username: true } },
        testCases: { orderBy: { order: 'asc' } },
      },
    });
    if (!problem) throw new NotFoundException('Problem not found');
    this.assertCanModify(problem.createdById, userId, role);

    return {
      ...this.toDetail(problem, { includeHidden: false }),
      hiddenTestCases: problem.testCases
        .filter((tc) => !tc.isSample)
        .map((tc) => ({
          id: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          order: tc.order,
        })),
    };
  }

  async create(input: ProblemFormInput, userId: string): Promise<ProblemDetail> {
    const slug = await this.ensureUniqueSlug(input.slug || slugify(input.title));

    const created = await this.prisma.problem.create({
      data: {
        slug,
        title: input.title.trim(),
        statement: input.statement.trim(),
        constraints: input.constraints?.trim() || null,
        examples: JSON.stringify(input.examples ?? []),
        difficulty: input.difficulty,
        visibility: input.visibility ?? ProblemVisibility.PUBLISHED,
        createdById: userId,
        testCases: {
          create: [
            ...input.sampleTestCases.map((t, i) => ({
              input: t.input,
              expectedOutput: t.expectedOutput,
              isSample: true,
              order: t.order ?? i,
            })),
            ...input.hiddenTestCases.map((t, i) => ({
              input: t.input,
              expectedOutput: t.expectedOutput,
              isSample: false,
              order: t.order ?? i,
            })),
          ],
        },
      },
      include: {
        createdBy: { select: { id: true, username: true } },
        testCases: { orderBy: { order: 'asc' } },
      },
    });
    return this.toDetail(created, { includeHidden: false });
  }

  async update(
    id: string,
    input: ProblemFormInput,
    userId: string,
    role: UserRole,
  ): Promise<ProblemDetail> {
    const existing = await this.prisma.problem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Problem not found');
    this.assertCanModify(existing.createdById, userId, role);

    const slug =
      input.slug && input.slug !== existing.slug
        ? await this.ensureUniqueSlug(input.slug, id)
        : existing.slug;

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.testCase.deleteMany({ where: { problemId: id } });
      return tx.problem.update({
        where: { id },
        data: {
          slug,
          title: input.title.trim(),
          statement: input.statement.trim(),
          constraints: input.constraints?.trim() || null,
          examples: JSON.stringify(input.examples ?? []),
          difficulty: input.difficulty,
          visibility: input.visibility ?? existing.visibility,
          testCases: {
            create: [
              ...input.sampleTestCases.map((t, i) => ({
                input: t.input,
                expectedOutput: t.expectedOutput,
                isSample: true,
                order: t.order ?? i,
              })),
              ...input.hiddenTestCases.map((t, i) => ({
                input: t.input,
                expectedOutput: t.expectedOutput,
                isSample: false,
                order: t.order ?? i,
              })),
            ],
          },
        },
        include: {
          createdBy: { select: { id: true, username: true } },
          testCases: { orderBy: { order: 'asc' } },
        },
      });
    });

    return this.toDetail(updated, { includeHidden: false });
  }

  async remove(id: string, userId: string, role: UserRole): Promise<void> {
    const existing = await this.prisma.problem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Problem not found');
    this.assertCanModify(existing.createdById, userId, role);
    await this.prisma.problem.delete({ where: { id } });
  }

  async listByAuthor(userId: string): Promise<ProblemListItem[]> {
    const rows = await this.prisma.problem.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, username: true } } },
    });
    return rows.map((r) => this.toListItem(r));
  }

  async getHiddenTestCasesForJudge(problemId: string): Promise<
    { input: string; expectedOutput: string; order: number }[]
  > {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: { where: { isSample: false }, orderBy: { order: 'asc' } } },
    });
    if (!problem) throw new NotFoundException('Problem not found');
    return problem.testCases.map((t) => ({
      input: t.input,
      expectedOutput: t.expectedOutput,
      order: t.order,
    }));
  }

  private assertCanModify(ownerId: string, userId: string, role: UserRole): void {
    if (ownerId !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to modify this problem');
    }
  }

  private async ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
    const normalized = slugify(base) || `problem-${randomSuffix(6)}`;
    let candidate = normalized;
    for (let attempt = 0; attempt < 5; attempt++) {
      const exists = await this.prisma.problem.findFirst({
        where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
        select: { id: true },
      });
      if (!exists) return candidate;
      candidate = `${normalized}-${randomSuffix(4)}`;
    }
    throw new Error('Could not generate a unique slug');
  }

  private buildMeta(total: number, page: number, pageSize: number) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return {
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  private toListItem(row: ProblemWithAuthor): ProblemListItem {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      difficulty: row.difficulty as Difficulty,
      createdAt: row.createdAt.toISOString(),
      author: { id: row.createdBy.id, username: row.createdBy.username },
    };
  }

  private toDetail(
    row: ProblemWithAuthorAndCases,
    opts: { includeHidden: boolean },
  ): ProblemDetail {
    const examples: ProblemExample[] = safeParseExamples(row.examples);
    const samples: SampleTestCase[] = row.testCases
      .filter((tc) => tc.isSample || opts.includeHidden)
      .map((tc) => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        order: tc.order,
      }));

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      statement: row.statement,
      constraints: row.constraints,
      examples,
      difficulty: row.difficulty as Difficulty,
      visibility: row.visibility as ProblemVisibility,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      author: { id: row.createdBy.id, username: row.createdBy.username },
      sampleTestCases: samples,
    };
  }
}

function safeParseExamples(raw: string): ProblemExample[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ProblemExample[];
    return [];
  } catch {
    return [];
  }
}
