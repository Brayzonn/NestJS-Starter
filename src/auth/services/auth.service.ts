import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LessThan, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';

import { AuthDto, JwtPayload, LoginDto, RegisterDto } from '../dto/auth.dto';
import { RefreshToken } from 'src/entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,

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

    await this.refreshTokenRepository.manager.transaction(async (manager) => {
      await manager.update(
        RefreshToken,
        { userId: user.id, isRevoked: false },
        { isRevoked: true },
      );
    });

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      payload: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ success: boolean; message: string }> {
    if (!registerDto.password) {
      throw new UnauthorizedException('Provide password');
    }

    if (!registerDto.email) {
      throw new UnauthorizedException('Provide valid email');
    }

    if (!registerDto.username) {
      throw new UnauthorizedException('Provide a username');
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

    return {
      success: true,
      message: 'User registered successfully',
    };
  }

  async logout(refreshToken: string, userId: string): Promise<boolean> {
    const tokens = await this.refreshTokenRepository.find({
      where: { userId, isRevoked: false },
    });

    for (const tokenEntity of tokens) {
      const isValid = await bcrypt.compare(refreshToken, tokenEntity.token);
      if (isValid) {
        await this.refreshTokenRepository.update(
          { id: tokenEntity.id },
          { isRevoked: true },
        );
        return true;
      }
    }

    return false;
  }

  async logoutAllDevices(userId: string): Promise<void> {
    await this.revokeAllUserRefreshTokens(userId);
  }

  private async generateTokens(
    user: User,
  ): Promise<{ access_token: string; refresh_token: string }> {
    await this.cleanupExpiredTokensForUser(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_ACCESS_EXPIRATION', '30m'),
    });

    const tokenId = randomUUID();
    const refreshTokenValue = crypto.randomBytes(64).toString('hex');
    const hashedRefreshToken = await bcrypt.hash(refreshTokenValue, 10);

    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(
      refreshTokenExpiry.getDate() +
        parseInt(this.config.get('JWT_REFRESH_EXPIRATION_DAYS', '7')),
    );

    const refreshToken = this.refreshTokenRepository.create({
      tokenId,
      token: hashedRefreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiry,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return {
      access_token,
      refresh_token: `${tokenId}.${refreshTokenValue}`,
    };
  }

  private async cleanupExpiredTokensForUser(userId: string): Promise<void> {
    const result = await this.refreshTokenRepository.delete({
      userId,
      expiresAt: LessThan(new Date()),
    });

    if (result.affected && result.affected > 0) {
      console.log(
        `Deleted ${result.affected} expired tokens for user ${userId}`,
      );
    }
  }

  private async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, createdAt: LessThan(new Date()) },
      { isRevoked: true },
    );
  }

  async refreshTokens(refreshToken: string): Promise<AuthDto> {
    const [tokenId, secretValue] = refreshToken.split('.');

    if (!tokenId || !secretValue) {
      throw new UnauthorizedException('Malformed refresh token');
    }

    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { tokenId, isRevoked: false },
    });

    if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const isValid = await bcrypt.compare(secretValue, tokenEntity.token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepository.update(
      { id: tokenEntity.id },
      { isRevoked: true },
    );

    const user = await this.usersRepository.findOne({
      where: { id: tokenEntity.userId },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      payload: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }
}
