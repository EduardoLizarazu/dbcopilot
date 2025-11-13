import { Module } from '@nestjs/common';
import { SqlqueryService } from './sqlquery.service';
import { SqlqueryController } from './sqlquery.controller';

@Module({
  controllers: [SqlqueryController],
  providers: [SqlqueryService],
})
export class SqlqueryModule {}
