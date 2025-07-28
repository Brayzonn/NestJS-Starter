import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() userData: { email: string; firstName: string; lastName: string },
  ) {
    return await this.usersService.create(userData);
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Patch(':id/increment-visits')
  async incrementVisits(@Param('id') id: number) {
    const updatedUser = await this.usersService.incrementVisits(+id);
    return {
      message: 'Visits incremented successfully',
      user: updatedUser,
    };
  }
}
