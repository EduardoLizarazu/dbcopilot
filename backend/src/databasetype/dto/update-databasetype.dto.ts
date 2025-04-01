import { PartialType } from '@nestjs/swagger';
import { CreateDatabasetypeDto } from './create-databasetype.dto';

export class UpdateDatabasetypeDto extends PartialType(CreateDatabasetypeDto) {}
