import { createParamDecorator, ExecutionContext } from '@nestjs/common';

//@CurrentUser
//On créer un decorator pour l'utilisateur en session 
//Sa evite de se trinbaler l'objet 'request'  [Confort Visuel]

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);