import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';

//redis for prod
// import { createClient } from 'redis';
// import RedisStore from 'connect-redis';

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
      sameSite: 'strict',
    },
    name: 'serverSessionID',
  };

  // Production: Use Redis store
  //   if (nodeEnv === 'production') {
  //     const redisClient = createClient({
  //       socket: {
  //         host: configService.get<string>('REDIS_HOST', 'localhost'),
  //         port: configService.get<number>('REDIS_PORT', 6379),
  //       }
  //     });

  //     redisClient.connect().catch(console.error);

  //     sessionConfig.store = new RedisStore({
  //       client: redisClient,
  //       prefix: 'myapp:',
  //     });
  //   }

  app.use(session(sessionConfig));
}
