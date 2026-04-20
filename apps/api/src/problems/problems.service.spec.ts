import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Difficulty, ProblemVisibility, UserRole } from '@au/types';
import { ProblemsService } from './problems.service';
import type { PrismaService } from '../prisma/prisma.service';

describe('ProblemsService', () => {
  const fakeProblem = {
    id: 'p1',
    slug: 'two-sum',
    title: 'Two Sum',
    statement: 'stmt',
    constraints: null,
    examples: JSON.stringify([]),
    difficulty: Difficulty.EASY,
    visibility: ProblemVisibility.PUBLISHED,
    createdById: 'owner',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    createdBy: { id: 'owner', username: 'owner' },
    testCases: [
      { id: 't1', input: '1', expectedOutput: '1', isSample: true, order: 0 },
      { id: 't2', input: '2', expectedOutput: '2', isSample: false, order: 1 },
    ],
  };

  let prisma: jest.Mocked<PrismaService>;
  let service: ProblemsService;

  beforeEach(() => {
    prisma = {
      problem: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      testCase: { deleteMany: jest.fn() },
      $transaction: jest.fn(),
    } as unknown as jest.Mocked<PrismaService>;
    service = new ProblemsService(prisma);
  });

  describe('getBySlug', () => {
    it('returns problem with only sample test cases for public users', async () => {
      (prisma.problem.findUnique as jest.Mock).mockResolvedValue(fakeProblem);
      const detail = await service.getBySlug('two-sum');
      expect(detail.sampleTestCases).toHaveLength(1);
      expect(detail.sampleTestCases[0]?.input).toBe('1');
    });

    it('throws NotFound for unpublished problem', async () => {
      (prisma.problem.findUnique as jest.Mock).mockResolvedValue({
        ...fakeProblem,
        visibility: ProblemVisibility.DRAFT,
      });
      await expect(service.getBySlug('two-sum')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFound when problem does not exist', async () => {
      (prisma.problem.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getBySlug('nope')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('prevents non-owner non-admin from deleting', async () => {
      (prisma.problem.findUnique as jest.Mock).mockResolvedValue({ ...fakeProblem });
      await expect(service.remove('p1', 'stranger', UserRole.USER)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('allows the owner to delete', async () => {
      (prisma.problem.findUnique as jest.Mock).mockResolvedValue({ ...fakeProblem });
      (prisma.problem.delete as jest.Mock).mockResolvedValue(fakeProblem);
      await service.remove('p1', 'owner', UserRole.USER);
      expect(prisma.problem.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    });

    it('allows an admin to delete any problem', async () => {
      (prisma.problem.findUnique as jest.Mock).mockResolvedValue({ ...fakeProblem });
      (prisma.problem.delete as jest.Mock).mockResolvedValue(fakeProblem);
      await service.remove('p1', 'someone', UserRole.ADMIN);
      expect(prisma.problem.delete).toHaveBeenCalled();
    });
  });
});
