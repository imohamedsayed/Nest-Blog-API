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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

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

      return {
        user,
        access_token: await this.signToken({
          sub: user.id,
          email: user.email,
          role: user.role,
        }),
      };
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

    return {
      user,
      access_token: await this.signToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
    };
  }

  signToken(payload: {
    sub: number;
    email: string;
    role: 'USER' | 'ADMIN';
  }): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '1h',
    });
  }
}
