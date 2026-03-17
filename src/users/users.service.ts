import { Injectable, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    return this.usersRepository.create(createUserDto);
  }

  findAll(): Promise<UserDocument[]> {
    return this.usersRepository.findAll();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.usersRepository.findById(id);
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findByEmail(email);
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    return this.usersRepository.update(id, updateUserDto);
  }

  remove(id: string): Promise<void> {
    return this.usersRepository.delete(id);
  }
}
