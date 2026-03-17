import { Roles } from '../../src/common/decorators/roles.decorator';
import { Role } from '../../src/common/enums/role.enum';
import 'reflect-metadata';

describe('Roles Decorator', () => {
  it('should set roles metadata on handler', () => {
    class TestClass {
      @Roles(Role.Admin)
      method() {}
    }

    const roles = Reflect.getMetadata('roles', TestClass.prototype.method);
    expect(roles).toEqual([Role.Admin]);
  });
});
