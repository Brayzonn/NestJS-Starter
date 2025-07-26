import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.preload({
      id,
      ...updateData,
    });

    if (!user) {
      throw new Error('User not found');
    }

    return await this.usersRepository.save(user);
  }

  async incrementVisits(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    await this.usersRepository.increment({ id }, 'visits', 1);

    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new Error('User not found after update');
    }

    return updatedUser;
  }
}
