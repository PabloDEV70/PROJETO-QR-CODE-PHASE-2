import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BodyDto = createParamDecorator((data: unknown, _ctx: ExecutionContext) => {
  return data;
});
