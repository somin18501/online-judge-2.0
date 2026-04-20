import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { SessionService } from '../session.service';
import { AuthService } from '../auth.service';
import type { RequestUser } from '../decorators/current-user.decorator';

/**
 * Populates `req.user` if a valid session is present, otherwise allows the
 * request to continue unauthenticated. Useful for public endpoints that
 * optionally surface user-aware data.
 */
@Injectable()
export class OptionalSessionGuard implements CanActivate {
  constructor(
    private readonly sessions: SessionService,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const token = req.cookies?.[this.sessions.cookieName];
    const session = await this.sessions.validate(token);
    if (session) {
      const user = await this.auth.getPublicUser(session.userId).catch(() => null);
      if (user) {
        req.user = { ...user, sessionId: session.sessionId };
      }
    }
    return true;
  }
}
