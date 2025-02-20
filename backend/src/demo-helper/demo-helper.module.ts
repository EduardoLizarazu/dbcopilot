import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/auth/permissions/entities/permission.entity';
import { Role } from 'src/auth/roles/entities/role.entity';
import { UsersModule } from '../users/users.module';
import { DemoHelperController } from './demo-helper.controller';
import { DemoHelperService } from './demo-helper.service';

@Module({
  controllers: [DemoHelperController],
  providers: [DemoHelperService],
  imports: [UsersModule, TypeOrmModule.forFeature([Role, Permission])],
})
export class DemoHelperModule {}
