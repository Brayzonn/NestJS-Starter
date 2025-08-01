import { streamService } from 'src/entities/user.entity';
import { UserRole } from 'src/entities/user.entity';
import { IsEmail, IsEnum, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsEnum(streamService)
  streamingService: streamService;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;

  @IsUUID('4', { message: 'Invalid user ID format' })
  userId: string;
}

export interface AuthDto {
  access_token: string;
  refresh_token: string;
  payload: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
  };
}

export interface JwtPayload {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  access_token: string;
  payload: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
  };
}
