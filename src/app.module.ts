import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig, databaseConfig, redisConfig } from './config';
import { validationSchema } from './config/validation.schema';
import { HealthModule } from './modules/health';

@Module({
  imports: [
    // Configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      validationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),

    // Database - PostgreSQL with TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        autoLoadEntities: true,
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
      }),
    }),

    // Redis
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: `redis://${configService.get('redis.host')}:${configService.get('redis.port')}`,
      }),
    }),

    // Health checks
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
