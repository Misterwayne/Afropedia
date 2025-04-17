import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString() // Could be username or email for login
  @IsNotEmpty()
  loginIdentifier: string; // We'll handle if it's username or email in the service

  @IsString()
  @IsNotEmpty()
  password: string;
}