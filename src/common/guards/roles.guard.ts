import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Auth, ROLES_KEY } from '../decorators/auth.decorator';
import { Role } from '../../generated/prisma/enums';

/**
 * Guard d'autorisations : RolesGuard
 * 
 * Son rôle est de comparer les permissions de l'utilisateur (ses rôles) 
 * avec les permissions requises par la route qu'il tente d'appeler.
 */
@Injectable()
export class RolesGuard implements CanActivate {

    //On lis les metadonnées envoyé par le decorateur
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {

        //On récupère les rôles configurés sur la route ou sur le contrôleur.
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            //La méthode 
            context.getHandler(),
            //Le controller
            context.getClass(),
        ]);

        //Si pas de roles sur la route : accessible à tous
        if (!requiredRoles || requiredRoles.length === 0) return true;

        //On récupère l'utilisateur injecté dans la requête par Passport
        const { user } = context.switchToHttp().getRequest();

        //Si l'user a pas le bon role requis, on lui bloque l'acces 403
        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException('Accès strictement réservé');
        }
        return true;
    }
}