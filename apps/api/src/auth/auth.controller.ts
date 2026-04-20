import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { OptionalSessionGuard } from './guards/optional-session.guard';
import { CurrentUser, type RequestUser } from './decorators/current-user.decorator';
import type { AuthResponse, SessionResponse } from '@au/types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly sessions: SessionService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() body: SignupDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const user = await this.auth.signup(body);
    const session = await this.sessions.issue(
      user.id,
      req.headers['user-agent'],
      extractIp(req),
    );
    this.sessions.setCookie(res, session.rawToken, session.expiresAt);
    return { user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const user = await this.auth.validateCredentials(body);
    const session = await this.sessions.issue(
      user.id,
      req.headers['user-agent'],
      extractIp(req),
    );
    this.sessions.setCookie(res, session.rawToken, session.expiresAt);
    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const token = req.cookies?.[this.sessions.cookieName];
    await this.sessions.revokeByToken(token);
    this.sessions.clearCookie(res);
  }

  @Get('session')
  @UseGuards(OptionalSessionGuard)
  async session(@CurrentUser() user: RequestUser | null): Promise<SessionResponse> {
    if (!user) return { user: null };
    const { sessionId: _sessionId, ...publicUser } = user;
    return { user: publicUser };
  }
}

function extractIp(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim();
  if (Array.isArray(forwarded)) return forwarded[0];
  return req.socket?.remoteAddress;
}
