import { PartialType } from '@nestjs/swagger';
import { CreateSqlqueryDto } from './create-sqlquery.dto';

export class UpdateSqlqueryDto extends PartialType(CreateSqlqueryDto) {}
