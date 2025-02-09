import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  subscribers: [__dirname + '/../subscribers/**/*{.ts,.js}'],
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
});
