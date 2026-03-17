import { JwtStrategy } from '../../src/auth/jwt.strategy';

describe('JwtStrategy', () => {
  it('validate should return payload', async () => {
    const strategy = new JwtStrategy();
    const payload = { sub: 'abc', email: 'test@localhost.com', role: 'user' };
    const result = await strategy.validate(payload as any);
    expect(result).toEqual(payload);
  });

  it('validate should throw on invalid payload', async () => {
    const strategy = new JwtStrategy();
    await expect(strategy.validate({} as any)).rejects.toThrow();
  });
});
