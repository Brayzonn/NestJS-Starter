import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthDto, JwtPayload, LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthDto> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_ACCESS_EXPIRATION', '30m'),
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return {
      refresh_token,
      access_token,
      payload: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthDto> {
    if (!registerDto.password) {
      throw new UnauthorizedException('Provide password');
    }

    if (!registerDto.email) {
      throw new UnauthorizedException('Provide valid email');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const existingUsername = await this.usersRepository.findOne({
      where: { username: registerDto.username },
    });

    if (existingUsername) {
      throw new UnauthorizedException('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = this.usersRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      password: hashedPassword,
      streamingService: registerDto.streamingService,
    });

    await this.usersRepository.save(newUser);

    const payload = { sub: newUser.id };
    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_ACCESS_EXPIRATION', '30m'),
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return {
      access_token,
      refresh_token,
      payload: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
    };
  }
}
