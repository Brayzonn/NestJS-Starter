import { streamService } from 'src/entities/user.entity';
import { UserRole } from 'src/entities/user.entity';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  username: string;
  streamingService: streamService;
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
