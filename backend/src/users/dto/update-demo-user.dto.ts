import { PartialType } from '@nestjs/mapped-types';
import { Role } from 'src/auth/roles/entities/role.entity';
import { AccountStatus } from '../enums/user.enums';
import { CreateUserDto } from './create-user.dto';
import { Permission } from 'src/auth/permissions/entities/permission.entity';

export class UpdateUserDemoDto extends PartialType(CreateUserDto) {
  roles?: Role[];
  permissions?: Permission[];
  accountStatus?: AccountStatus;
}
