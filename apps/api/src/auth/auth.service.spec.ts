import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import type { PrismaService } from '../prisma/prisma.service';

function createMockUser(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    id: 'user-1',
    email: 'test@example.com',
    username: 'tester',
    role: 'USER',
    passwordHash: 'hashed',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('AuthService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let passwords: jest.Mocked<PasswordService>;
  let service: AuthService;

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;
    passwords = {
      hash: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<PasswordService>;
    service = new AuthService(prisma, passwords);
  });

  describe('signup', () => {
    it('creates a user when email and username are available', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      passwords.hash.mockResolvedValue('hashed-pw');
      (prisma.user.create as jest.Mock).mockResolvedValue(createMockUser());

      const user = await service.signup({
        email: 'test@example.com',
        username: 'tester',
        password: 'Pass1234',
      });

      expect(passwords.hash).toHaveBeenCalledWith('Pass1234');
      expect(user).toMatchObject({ email: 'test@example.com', username: 'tester', role: 'USER' });
    });

    it('rejects duplicate email', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        username: 'other',
      });
      await expect(
        service.signup({ email: 'test@example.com', username: 'tester', password: 'Pass1234' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects duplicate username', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        email: 'other@example.com',
        username: 'tester',
      });
      await expect(
        service.signup({ email: 'test@example.com', username: 'tester', password: 'Pass1234' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('validateCredentials', () => {
    it('returns the public user on valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(createMockUser());
      passwords.verify.mockResolvedValue(true);
      const result = await service.validateCredentials({
        email: 'test@example.com',
        password: 'Pass1234',
      });
      expect(result.email).toBe('test@example.com');
    });

    it('rejects unknown email with unauthorized', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.validateCredentials({ email: 'x@example.com', password: 'Pass1234' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects incorrect password with unauthorized', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(createMockUser());
      passwords.verify.mockResolvedValue(false);
      await expect(
        service.validateCredentials({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
