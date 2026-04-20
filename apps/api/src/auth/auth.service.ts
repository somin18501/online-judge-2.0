import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import type { PublicUser } from '@au/types';

export interface SignupInput {
  email: string;
  username: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
  ) {}

  async signup(input: SignupInput): Promise<PublicUser> {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { username: input.username }] },
      select: { email: true, username: true },
    });
    if (existing) {
      if (existing.email === input.email) {
        throw new ConflictException('Email is already registered');
      }
      throw new ConflictException('Username is already taken');
    }

    const passwordHash = await this.passwords.hash(input.password);
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
      },
    });
    return this.toPublicUser(user);
  }

  async validateCredentials(input: LoginInput): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const ok = await this.passwords.verify(user.passwordHash, input.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.toPublicUser(user);
  }

  async getPublicUser(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.toPublicUser(user);
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    username: string;
    role: string;
    createdAt: Date;
  }): PublicUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role as PublicUser['role'],
      createdAt: user.createdAt.toISOString(),
    };
  }
}
