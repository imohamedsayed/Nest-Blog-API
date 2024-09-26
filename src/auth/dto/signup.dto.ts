import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
export class SignupDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
