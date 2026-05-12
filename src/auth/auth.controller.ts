import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  //Route de register
  @Post('register')
  //on capte les datas avec Body et on compare avec nos DTO (Validator quoi)
  //on return la méthode de notre service
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  //Route de login
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

}
