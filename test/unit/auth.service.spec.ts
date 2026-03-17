import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  const mockUsersRepo = {
    findByEmail: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn(() => 'token-123'),
  };

  beforeEach(() => {
    authService = new AuthService(mockUsersRepo as any, mockJwtService as any);
    jest.clearAllMocks();
  });

  it('should throw if email not found', async () => {
    mockUsersRepo.findByEmail.mockResolvedValue(null);
    await expect(
      authService.login('missing@localhost.com', '123'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if password is invalid', async () => {
    mockUsersRepo.findByEmail.mockResolvedValue({
      password: '$2a$10$rVh.mpVpQylYf9V7p7yZ6OdpCRuS0ZRiYNGzHosmwaGXliMUcAdtC',
    }); // bcrypt hash of 'secret'
    await expect(
      authService.login('admin@localhost.com', 'wrong'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should validateUser return null when invalid', async () => {
    mockUsersRepo.findByEmail.mockResolvedValue(null);
    await expect(
      authService.validateUser('missing@localhost.com', 'pwd'),
    ).resolves.toBeNull();
  });

  it('should validateUser return user when valid', async () => {
    const hash = await bcrypt.hash('admin123', 10);
    const user = {
      _id: 'id1',
      email: 'admin@localhost.com',
      role: 'admin',
      password: hash,
    };
    mockUsersRepo.findByEmail.mockResolvedValue(user);

    await expect(
      authService.validateUser('admin@localhost.com', 'admin123'),
    ).resolves.toEqual(user);
  });

  it('should validateUser return null for invalid password', async () => {
    const hash = await bcrypt.hash('admin123', 10);
    const user = {
      _id: 'id1',
      email: 'admin@localhost.com',
      role: 'admin',
      password: hash,
    };
    mockUsersRepo.findByEmail.mockResolvedValue(user);

    await expect(
      authService.validateUser('admin@localhost.com', 'wrong'),
    ).resolves.toBeNull();
  });

  it('should login successfully', async () => {
    const hash = await bcrypt.hash('admin123', 10);
    mockUsersRepo.findByEmail.mockResolvedValue({
      _id: 'id1',
      email: 'admin@localhost.com',
      role: 'admin',
      password: hash,
    });

    const result = await authService.login('admin@localhost.com', 'admin123');
    expect(result).toEqual({
      accessToken: 'token-123',
      user: {
        id: 'id1',
        email: 'admin@localhost.com',
        role: 'admin',
      },
    });
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: 'id1',
      email: 'admin@localhost.com',
      role: 'admin',
    });
  });
});
