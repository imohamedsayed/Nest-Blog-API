import { JwtGuard } from 'src/auth/guards';
import { UserService } from './user.service';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';

@Controller('users')
export class UserController {
  constructor(private UserService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('profile')
  users(@GetUser() user) {
    return user;
  }
}
