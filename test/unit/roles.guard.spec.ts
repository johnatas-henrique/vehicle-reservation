import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../src/common/guards/roles.guard';
import { Role } from '../../src/common/enums/role.enum';

const createContext = (handlerRoles, user) => ({
  getHandler: () => handlerRoles || (() => null),
  switchToHttp: () => ({
    getRequest: () => ({ user }),
  }),
});

describe('RolesGuard', () => {
  let guard: RolesGuard;
  beforeEach(() => {
    guard = new RolesGuard(new Reflector());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should allow when no roles are required', () => {
    const context = createContext(undefined, { role: Role.User });
    expect(guard.canActivate(context as any)).toBe(true);
  });

  it('should allow when user has required role', () => {
    jest.spyOn(Reflector.prototype, 'get').mockReturnValue([Role.Admin]);
    const context = createContext(null, { role: Role.Admin });
    expect(guard.canActivate(context as any)).toBe(true);
  });

  it('should throw when role is not allowed', () => {
    jest.spyOn(Reflector.prototype, 'get').mockReturnValue([Role.Admin]);
    const context = createContext(null, { role: Role.User });
    expect(() => guard.canActivate(context as any)).toThrow();
  });
});
