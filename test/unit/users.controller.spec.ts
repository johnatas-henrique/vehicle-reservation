import { UsersController } from '../../src/users/users.controller';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role } from '../../src/common/enums/role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  const mockService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    controller = new UsersController(mockService as any);
  });

  it('findAll returns list from service', async () => {
    mockService.findAll.mockResolvedValue([{ email: 'a@x.com' }]);
    await expect(controller.findAll()).resolves.toEqual([{ email: 'a@x.com' }]);
  });

  it('create returns created user', async () => {
    mockService.create.mockResolvedValue({ email: 'b@x.com' });
    await expect(controller.create({} as any)).resolves.toEqual({
      email: 'b@x.com',
    });
  });

  it('findOne throws not found when no user', async () => {
    mockService.findById.mockResolvedValue(null);
    await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
  });

  it('update allows owner', async () => {
    mockService.update.mockResolvedValue({ name: 'Updated' });
    const req = { user: { sub: '1', role: Role.User } };
    await expect(
      controller.update('1', { name: 'Updated' } as any, req as any),
    ).resolves.toEqual({ name: 'Updated' });
  });

  it('findOne returns user when found', async () => {
    mockService.findById.mockResolvedValue({ _id: '1', email: 'u@x.com' });
    await expect(controller.findOne('1')).resolves.toEqual({
      _id: '1',
      email: 'u@x.com',
    });
  });

  it('update denies non-owner non-admin', async () => {
    const req = { user: { sub: '2', role: Role.User } };
    await expect(
      controller.update('1', { name: 'Updated' } as any, req as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('update allows admin', async () => {
    mockService.update.mockResolvedValue({ name: 'Updated' });
    const req = { user: { sub: '3', role: Role.Admin } };
    await expect(
      controller.update('1', { name: 'Updated' } as any, req as any),
    ).resolves.toEqual({ name: 'Updated' });
  });

  it('admin can delete any user', async () => {
    mockService.remove.mockResolvedValue(undefined);
    const req = { user: { sub: '2', role: Role.Admin } };
    await expect(controller.remove('1', req as any)).resolves.toEqual({
      deleted: true,
    });
  });

  it('remove denies non-owner non-admin', async () => {
    const req = { user: { sub: '2', role: Role.User } };
    await expect(controller.remove('1', req as any)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
