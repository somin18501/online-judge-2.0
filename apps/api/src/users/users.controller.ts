import { Controller, Get, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/guards/session.guard';
import { CurrentUser, type RequestUser } from '../auth/decorators/current-user.decorator';
import type { PublicUser } from '@au/types';

@Controller('users')
export class UsersController {
  @Get('me')
  @UseGuards(SessionGuard)
  getMe(@CurrentUser() user: RequestUser): PublicUser {
    const { sessionId: _sid, ...publicUser } = user;
    return publicUser;
  }
}
