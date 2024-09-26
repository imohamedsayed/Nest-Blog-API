import { DatabaseService } from 'src/database/database.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
@Injectable()
export class AuthService {
  constructor(private db: DatabaseService) {}

  async signup(signupDto: SignupDto) {
    try {
      const hash = await argon.hash(signupDto.password);

      const user = await this.db.user.create({
        data: {
          ...signupDto,
          password: hash,
        },
      });

      delete user.password;

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken by another user');
        }
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.db.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await argon.verify(user.password, loginDto.password);

    if (!match) throw new UnauthorizedException('Invalid credentials');

    delete user.password;

    return user;
  }
}
