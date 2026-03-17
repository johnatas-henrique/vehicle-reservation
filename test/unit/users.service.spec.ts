import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UsersService } from '../../src/users/users.service';
import { UsersRepository } from '../../src/users/users.repository';

const userMock = {
  _id: '1',
  name: 'Example',
  email: 'test@example.com',
  role: 'user',
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: Partial<UsersRepository>;

  beforeEach(async () => {
    repository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(userMock),
      findAll: jest.fn().mockResolvedValue([userMock]),
      findById: jest.fn().mockResolvedValue(userMock),
      update: jest.fn().mockResolvedValue(userMock),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should create user', async () => {
    const user = await service.create({ name: 'Example', email: 'test@example.com', password: '123456' });
    expect(user).toEqual(userMock);
    expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should throw when duplicate email', async () => {
    (repository.findByEmail as jest.Mock).mockResolvedValue(userMock);
    await expect(
      service.create({ name: 'Example', email: 'test@example.com', password: '123456' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('should return all users', async () => {
    const users = await service.findAll();
    expect(users).toEqual([userMock]);
  });

  it('should update user', async () => {
    const updated = await service.update('1', { name: 'New Name' });
    expect(updated).toEqual(userMock);
  });

  it('should find by id', async () => {
    (repository.findById as jest.Mock).mockResolvedValue(userMock);
    const user = await service.findById('1');
    expect(user).toEqual(userMock);
  });

  it('should find by email', async () => {
    (repository.findByEmail as jest.Mock).mockResolvedValue(userMock);
    const user = await service.findByEmail('test@example.com');
    expect(user).toEqual(userMock);
  });

  it('should delete user', async () => {
    await expect(service.remove('1')).resolves.toBeUndefined();
  });
});
