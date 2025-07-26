import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redisClient = new Redis({
  host: 'localhost',
  port: 6379,
  enableOfflineQueue: false,
});

const rateLimiters = {
  default: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'default',
    points: 20,
    duration: 60,
  }),

  auth: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'auth',
    points: 5,
    duration: 300,
  }),

  upload: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'upload',
    points: 2,
    duration: 60,
  }),

  strict: new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'strict',
    points: 1,
    duration: 10,
  }),
};

export function createRateLimitMiddleware(
  type: keyof typeof rateLimiters = 'default',
  customMessage?: string,
) {
  @Injectable()
  class RateLimitMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
      try {
        if (!req.ip) {
          throw new BadRequestException('Missing IP address');
        }

        await rateLimiters[type].consume(req.ip);
        next();
      } catch (rejRes) {
        throw new HttpException(
          customMessage || `Too Many Requests (${type})`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }
  }

  return RateLimitMiddleware;
}

@Injectable()
export class DefaultRateLimitMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.ip) {
        throw new BadRequestException('Missing IP address');
      }
      await rateLimiters.default.consume(req.ip);
      next();
    } catch (rejRes) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
