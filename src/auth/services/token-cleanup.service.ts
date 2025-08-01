import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken } from '../../entities/refresh-token.entity';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredTokens() {
    this.logger.log('Starting cleanup of expired refresh tokens..');

    try {
      const result = await this.refreshTokenRepository.delete({
        expiresAt: LessThan(new Date()),
      });

      const deletedCount = result.affected || 0;

      if (deletedCount > 0) {
        this.logger.log(
          `Successfully deleted ${deletedCount} expired refresh tokens`,
        );
      } else {
        this.logger.log('No expired tokens found to delete');
      }
    } catch (error) {
      this.logger.error('Failed to cleanup expired tokens:', error);
    }
  }

  async manualCleanup(): Promise<number> {
    this.logger.log('Manual cleanup of expired refresh tokens...');

    try {
      const result = await this.refreshTokenRepository.delete({
        expiresAt: LessThan(new Date()),
      });

      const deletedCount = result.affected || 0;
      this.logger.log(`Manual cleanup: deleted ${deletedCount} expired tokens`);

      return deletedCount;
    } catch (error) {
      this.logger.error('Manual cleanup failed:', error);
      throw error;
    }
  }
}
