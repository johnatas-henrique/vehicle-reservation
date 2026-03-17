import { JwtAuthGuard } from '../../src/common/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  it('should have canActivate method', () => {
    const guard = new JwtAuthGuard();
    expect(typeof guard.canActivate).toBe('function');
  });

  it('canActivate should call parent implementation', () => {
    const parentGuard = AuthGuard('jwt');
    const spy = jest.spyOn(parentGuard.prototype, 'canActivate').mockReturnValue(true as any);
    const guard = new JwtAuthGuard();
    const result = guard.canActivate({} as any);
    expect(spy).toHaveBeenCalled();
    expect(result).toBe(true);
    spy.mockRestore();
  });
});
