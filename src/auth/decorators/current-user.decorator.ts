import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Décorateur personnalisé : @CurrentUser()
 * 
 * Il sert à extraire directement l'utilisateur de la requête HTTP sans avoir à 
 * manipuler l'objet "Request". 
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    //On switch le contexte d'exécution vers le protocole HTTP.
    const request = ctx.switchToHttp().getRequest();

    //On retourne le user de la requete 
    return request.user;
  },
);