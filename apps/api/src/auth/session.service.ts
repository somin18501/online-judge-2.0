import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'crypto';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import type { AppConfig } from '../config/env.config';

export interface IssuedSession {
  sessionId: string;
  rawToken: string;
  expiresAt: Date;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  get cookieName(): string {
    return this.config.get('cookieName', { infer: true });
  }

  async issue(userId: string, userAgent?: string, ipAddress?: string): Promise<IssuedSession> {
    const ttl = this.config.get('sessionTtlSeconds', { infer: true });
    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + ttl * 1000);

    const session = await this.prisma.session.create({
      data: {
        userId,
        tokenHash,
        userAgent: userAgent?.slice(0, 512),
        ipAddress: ipAddress?.slice(0, 64),
        expiresAt,
      },
    });

    return { sessionId: session.id, rawToken, expiresAt };
  }

  async validate(rawToken: string | undefined): Promise<{ userId: string; sessionId: string } | null> {
    if (!rawToken) return null;
    const tokenHash = this.hashToken(rawToken);
    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
    });
    if (!session) return null;
    if (session.revokedAt) return null;
    if (session.expiresAt.getTime() < Date.now()) {
      // Best-effort cleanup
      await this.prisma.session
        .update({ where: { id: session.id }, data: { revokedAt: new Date() } })
        .catch(() => undefined);
      return null;
    }
    return { userId: session.userId, sessionId: session.id };
  }

  async revokeByToken(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.session
      .updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => undefined);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  setCookie(res: Response, rawToken: string, expiresAt: Date): void {
    res.cookie(this.cookieName, rawToken, this.cookieOptions(expiresAt));
  }

  clearCookie(res: Response): void {
    res.clearCookie(this.cookieName, this.cookieOptions(new Date(0)));
  }

  requireSession(req: { cookies?: Record<string, string | undefined> }): string {
    const token = req.cookies?.[this.cookieName];
    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }
    return token;
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private cookieOptions(expires: Date) {
    const secure = this.config.get('cookieSecure', { infer: true });
    const sameSite = this.config.get('cookieSameSite', { infer: true });
    const domain = this.config.get('cookieDomain', { infer: true });
    return {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      path: '/',
      expires,
    } as const;
  }
}
