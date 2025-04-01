import { Module } from '@nestjs/common';
import { DatabasetypeService } from './databasetype.service';
import { DatabasetypeController } from './databasetype.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Databasetype } from './entities/databasetype.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Databasetype])],
  controllers: [DatabasetypeController],
  providers: [DatabasetypeService],
})
export class DatabasetypeModule {}
