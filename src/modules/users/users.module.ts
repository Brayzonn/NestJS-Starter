// import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';
// import { createRateLimitMiddleware } from 'src/common/middleware/rate-limit.middleware';
// import { User } from '../../entities/user.entity';

// const UploadRateLimit = createRateLimitMiddleware(
//   'upload',
//   'Upload limit exceeded',
// );

// @Module({
//   imports: [TypeOrmModule.forFeature([User])],
//   controllers: [UsersController],
//   providers: [UsersService],
// })
// export class UsersModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(UploadRateLimit).forRoutes(UsersController);
//   }
// }
