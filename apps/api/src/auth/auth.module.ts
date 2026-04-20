import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { PasswordService } from './password.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionService, PasswordService],
  exports: [AuthService, SessionService],
})
export class AuthModule {}
