import { UserService } from './user.service';
import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(private UserService: UserService) {}

  @Get()
  users() {
    return 'Hello nest from user controller';
  }
}
