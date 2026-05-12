import { Controller, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../generated/prisma/enums';



@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) { }

  /**
   * GET /users/me
   * Récupère le profil de l'utilisateur actuellement connecté
   * @Auth Décorateur personnalisé qui vérifie si l'utilisateur est authentifié (JWT)
   * @CurrentUser Décorateur personnalisé qui extrait l'utilisateur de la requête (Request)
   */
  @Get('me')
  @Auth()
  me(@CurrentUser() user: any) {
    //on cherche le user avec l'id extrait du token
    return this.usersService.findMe(user.id);
  }

  /**
   * PATCH /users/me
   * Met à jour les informations de l'utilisateur connecté
   * @Body Récupère les données envoyées dans le corps de la requête HTTP
   * UpdateUserDto : Valide la structure des données reçues
   */
  @Patch('me')
  @Auth()
  updateMe(
    @CurrentUser() user: any,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateMe(user.id, dto);
  }

  /**
   * DELETE /users/me
   * Permet à un utilisateur de supprimer son compte
   */
  @Delete('me')
  @Auth()
  deleteMe(@CurrentUser() user: any) {
    return this.usersService.deleteMe(user.id);
  }

  /**
   * GET /users/:id
   * Voir le profil d'un autre utilisateur 
   * @Params id : Récupère la valeur dynamique passée dans l'URL
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * GET /users
   * Liste tous les utilisateurs 
   * @Auth Roel.ADMIN : Seuls les utilisateurs avec le rôle 'ADMIN' peuvent accéder à cette route
   */
  @Get()
  @Auth(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * PATCH /users/:id/ban
   * Action administrative pour bannir un user
   * @Auth Roel.ADMIN : Seuls les utilisateurs avec le rôle 'ADMIN' peuvent accéder à cette route
   * On passe l'ID de l'admin et l'ID de l'utilisateur à bannir
   */
  @Patch(':id/ban')
  @Auth(Role.ADMIN)
  ban(
    @CurrentUser() admin: any,
    @Param('id') userId: string,
  ) {
    return this.usersService.ban(admin.id, userId);
  }

}