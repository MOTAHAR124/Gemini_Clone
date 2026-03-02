import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('auth.googleClientId') ?? '',
      clientSecret: configService.get<string>('auth.googleClientSecret') ?? '',
      callbackURL: configService.get<string>('auth.googleCallbackUrl') ?? '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      id: string;
      displayName: string;
      emails?: Array<{ value: string }>;
      photos?: Array<{ value: string }>;
    },
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error('Google account has no email'), false);
    }

    const avatarUrl =
      profile.photos?.[0]?.value ?? (await this.fetchGoogleAvatarFromUserinfo(accessToken));

    const authUser = await this.authService.validateGoogleLogin({
      email,
      googleId: profile.id,
      name: profile.displayName,
      avatarUrl,
    });

    done(null, authUser);
  }

  private async fetchGoogleAvatarFromUserinfo(accessToken: string): Promise<string | undefined> {
    try {
      const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        return undefined;
      }
      const payload = (await response.json()) as { picture?: unknown };
      return typeof payload.picture === 'string' ? payload.picture : undefined;
    } catch {
      return undefined;
    }
  }
}
