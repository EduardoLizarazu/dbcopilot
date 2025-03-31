import { Module } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { ConnectionController } from './connection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from './entities/connection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Connection])],
  controllers: [ConnectionController],
  providers: [ConnectionService],
})
export class ConnectionModule {}
