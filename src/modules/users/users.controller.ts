import {
  Controller,
  Get,
  // Post,
  // Body,
  // Param,
  // Patch,
  UseGuards,
  // Res,
  // Delete,
} from '@nestjs/common';
import { UserService } from './users.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly UserService: UserService) {}

  @Get()
  @Roles(Role.USER)
  async findAll() {
    return await this.UserService.findAll();
  }
}
