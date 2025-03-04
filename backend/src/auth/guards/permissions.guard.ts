import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PERMISSIONS_METEDATA_KEY } from '../decorators/permissions.decorator';
import { ClientPermission } from '../enums/permission.enum';
import { getClientPermissions } from '../helpers/auth.helpers';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private refector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredClientPermissions = this.refector.getAllAndOverride<
      ClientPermission[] | undefined
    >(PERMISSIONS_METEDATA_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredClientPermissions || requiredClientPermissions.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<{ user: any }>();
    const userPermissions = getClientPermissions(req.user as Partial<User>);

    return requiredClientPermissions.some((permission) =>
      userPermissions.has(permission),
    );
  }
}
