import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { SessionService } from '../session.service';
import { AuthService } from '../auth.service';
import type { RequestUser } from '../decorators/current-user.decorator';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly sessions: SessionService,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const token = req.cookies?.[this.sessions.cookieName];
    const session = await this.sessions.validate(token);
    if (!session) {
      throw new UnauthorizedException('Not authenticated');
    }
    const user = await this.auth.getPublicUser(session.userId);
    req.user = { ...user, sessionId: session.sessionId };
    return true;
  }
}
