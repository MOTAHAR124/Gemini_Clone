import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

type JwtExpiresIn = number | `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

interface GoogleLoginInput {
  email: string;
  googleId: string;
  name: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(input: RegisterDto): Promise<AuthResponse> {
    const exists = await this.usersService.findByEmail(input.email);
    if (exists) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.usersService.createLocalUser({
      email: input.email,
      name: input.name,
      passwordHash,
    });

    return this.toAuthResponse(user);
  }

  async login(input: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(input.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.toAuthResponse(user);
  }

  async validateGoogleLogin(input: GoogleLoginInput): Promise<AuthResponse> {
    const user = await this.usersService.upsertGoogleUser(input);
    return this.toAuthResponse(user);
  }

  async getProfile(userId: string): Promise<AuthResponse['user']> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
  }

  private toAuthResponse(user: UserDocument): AuthResponse {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('auth.jwtSecret'),
      expiresIn: (this.configService.get<string>('auth.jwtExpiresIn') ?? '7d') as JwtExpiresIn,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
