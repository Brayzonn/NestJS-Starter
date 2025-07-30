export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  username: string;
  streamingService: 'spotify' | 'apple_music' | 'youtube_music';
}

export interface AuthDto {
  access_token: string;
  refresh_token: string;
  payload: {
    id: string;
    email: string;
    username: string;
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
  };
}
