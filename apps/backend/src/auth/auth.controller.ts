import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    return { message: 'Redirecting to Google' };
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const authResponse = req.user as Awaited<ReturnType<AuthService['validateGoogleLogin']>>;
    const frontendUrl = this.configService.get<string>('app.frontendUrl', 'http://localhost:3000');
    const target = `${frontendUrl}/auth/callback?token=${encodeURIComponent(authResponse.accessToken)}`;
    return res.redirect(target);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: CurrentUserData) {
    return this.authService.getProfile(user.sub);
  }
}