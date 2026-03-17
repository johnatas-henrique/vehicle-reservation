import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../src/users/users.repository';

class FakeModel {
  static dataStore = [
    {
      _id: '1',
      name: 'Test',
      email: 'test@localhost.com',
      password: 'hash',
      role: 'user',
    },
  ];
  constructor(public value) {}
  save = jest
    .fn()
    .mockImplementation(async () => ({ _id: 'newid', ...this.value }));

  static find() {
    return {
      select: () => ({ exec: async () => FakeModel.dataStore }),
    };
  }

  static findById(id) {
    const sample = FakeModel.dataStore.find((item) => item._id === id);
    return {
      select: () => ({ exec: async () => (sample ? { ...sample } : null) }),
    };
  }

  static findOne(obj) {
    const sample = FakeModel.dataStore.find((item) => item.email === obj.email);
    return { exec: async () => (sample ? { ...sample } : null) };
  }

  static findByIdAndUpdate(id, update) {
    const sample = FakeModel.dataStore.find((item) => item._id === id);
    if (!sample) return { select: () => ({ exec: async () => null }) };
    Object.assign(sample, update.$set);
    return { select: () => ({ exec: async () => ({ ...sample }) }) };
  }

  static findByIdAndDelete(id) {
    const index = FakeModel.dataStore.findIndex((item) => item._id === id);
    if (index === -1) return { exec: async () => null };
    const [deleted] = FakeModel.dataStore.splice(index, 1);
    return { exec: async () => deleted };
  }

  select() {
    return this;
  }
  exec = jest.fn().mockResolvedValue(FakeModel.dataStore);
}

describe('UsersRepository', () => {
  let repository: UsersRepository;
  beforeEach(() => {
    repository = new UsersRepository(FakeModel as any);
  });

  it('create returns saved document', async () => {
    const result = await repository.create({
      name: 'New',
      email: 'new@localhost.com',
      password: 'pwd',
      role: 'user',
    } as any);
    expect(result).toHaveProperty('_id', 'newid');
  });

  it('findAll returns users', async () => {
    const result = await repository.findAll();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('findById returns null for missing', async () => {
    const result = await repository.findById('missing');
    expect(result).toBeNull();
  });

  it('findByEmail returns null for missing', async () => {
    const result = await repository.findByEmail('missing@localhost.com');
    expect(result).toBeNull();
  });

  it('update throws not found for missing id', async () => {
    await expect(
      repository.update('missing', { name: 'No' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('update should return updated user for existing id', async () => {
    const result = await repository.update('1', { name: 'Changed' } as any);
    expect(result).toMatchObject({ name: 'Changed' });
  });

  it('update should hash password when provided', async () => {
    const result = await repository.update('1', { password: 'newpass' } as any);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('password');
  });

  it('delete should remove existing user', async () => {
    await expect(repository.delete('1')).resolves.toBeUndefined();
  });

  it('delete throws not found for missing id', async () => {
    await expect(repository.delete('missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
