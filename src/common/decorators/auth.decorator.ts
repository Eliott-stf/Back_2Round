import { applyDecorators, UseGuards } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../../generated/prisma/enums';

export const ROLES_KEY = 'roles';

/**
 * Décorateur personnalisé "@Auth" 
 * permet de sécuriser une route en vérifiant le JWT ET les permissions (rôles).
 * 
 * @param roles Liste des rôles autorisés (ex: Role.ADMIN, Role.USER)
 */
export function Auth(...roles: Role[]) {
  return applyDecorators(
    //On set les datas qui seront lues par les guards
    SetMetadata(ROLES_KEY, roles),

    //On applique les guards dans l'ordre
    UseGuards(JwtAuthGuard, RolesGuard), 
  );
}