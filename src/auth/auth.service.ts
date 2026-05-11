import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  //constructeur Prisma (manager) et jwt
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) { }

  //========================
  //Méthode d'enregistrement 
  //========================

  async register(dto: RegisterDto) {

    //On vérifie que l'email n'existe pas déjà
    //requete avec prisma sur notre 'repository'
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('Cet email est déja utilisée')
    }

    //On hash le password avec la lib bcrypt
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    //On créer le user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        lastname: dto.lastname,
        email: dto.email,
        password: hashedPassword,
      },
    });

    //On retourne le user sans le password
    const { password, ...result } = user;
    return result;
  }

  //========================
  //Méthode de Login
  //========================

  async login(dto:LoginDto){
    //On va cherche le user rentré avec l'email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    //On vérifie son password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    //Si mauvais -> 401 
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    //On génére le JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwt.signAsync(payload);

    return { access_token: token };
  }
}