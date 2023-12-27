import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const ConcertPrice = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request);
  },
);
