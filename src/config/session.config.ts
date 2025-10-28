import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';

export function setupSessionAndCookies(
  app: INestApplication,
  configService: ConfigService,
): void {
  const cookieSecret = configService.get<string>(
    'COOKIE_SECRET',
    'your-cookie-secret',
  );
  const sessionSecret = configService.get<string>(
    'SESSION_SECRET',
    'your-session-secret',
  );
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  app.use(cookieParser(cookieSecret));

  const sessionConfig: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: nodeEnv === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2,
      sameSite: nodeEnv === 'production' ? 'none' : 'lax',
    },
    name: 'serverSessionID',
  };

  const redisClient = createClient({
    socket: {
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
    },
  });

  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis connected for session storage');
  });

  redisClient.connect().catch((err) => {
    console.error('Failed to connect to Redis:', err);
  });

  sessionConfig.store = new RedisStore({
    client: redisClient,
    prefix: 'musicstats:sess:',
    ttl: 7200,
  });

  app.use(session(sessionConfig));
}
