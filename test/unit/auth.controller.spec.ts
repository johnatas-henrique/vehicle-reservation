import { AuthController } from '../../src/auth/auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(() => {
    controller = new AuthController(mockAuthService as any);
  });

  it('login returns tokens from service', async () => {
    mockAuthService.login.mockResolvedValue({ accessToken: 'abc', user: { email: 'u@x.com' } });
    await expect(controller.login({ email: 'u@x.com', password: 'pwd' })).resolves.toEqual({ accessToken: 'abc', user: { email: 'u@x.com' } });
  });

  it('login throws unauthorized when no result', async () => {
    mockAuthService.login.mockResolvedValue(undefined);
    await expect(controller.login({ email: 'u@x.com', password: 'pwd' })).rejects.toThrow();
  });
});
