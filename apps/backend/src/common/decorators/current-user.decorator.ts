import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  sub: string;
  email: string;
  name: string;
}

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): CurrentUserData => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as CurrentUserData;
});