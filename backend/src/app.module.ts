import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { DemoHelperModule } from './demo-helper/demo-helper.module';
import { UsersModule } from './users/users.module';
import { CaslModule } from './casl/casl.module';
import { ChatModule } from './chat/chat.module';
import { Neo4jService } from './neo4j/neo4j/neo4j.service';
import { Neo4jModule } from './neo4j/neo4j/neo4j.module';
import { SchemaModule } from './schema/schema.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      database: process.env.DB_NAME as any,
      port: process.env.DB_PORT as any,
      username: process.env.DB_USER as any,
      password: process.env.DB_PASSWORD as any,
      // entities: [User],
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // for demo/development
      logging: true,
    }),
    Neo4jModule,
    UsersModule,
    AuthModule,
    DemoHelperModule,
    CaslModule,
    ChatModule,
    Neo4jModule,
    SchemaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Neo4jService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionsGuard,
    // },
  ],
})
export class AppModule {}
