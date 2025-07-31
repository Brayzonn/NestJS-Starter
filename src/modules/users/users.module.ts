import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { createRateLimitMiddleware } from 'src/common/middleware/rate-limit.middleware';
import { User } from '../../entities/user.entity';

const RateLimit = createRateLimitMiddleware('auth', 'Rate limit exceeded');

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimit).forRoutes(UsersController);
  }
}
