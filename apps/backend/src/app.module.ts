import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import configuration from './config/configuration';
import { validationSchema } from './config/env.validation';
import { EmbeddingModule } from './embedding/embedding.module';
import { GeminiModule } from './gemini/gemini.module';
import { ImageReaderModule } from './image-reader/image-reader.module';
import { PdfGeneratorModule } from './pdf-generator/pdf-generator.module';
import { PdfRagModule } from './pdf-rag/pdf-rag.module';
import { UsersModule } from './users/users.module';
import { VectorModule } from './vector/vector.module';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [configuration],
      validationSchema,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.mongoUri'),
      }),
    }),
    UsersModule,
    AuthModule,
    GeminiModule,
    EmbeddingModule,
    VectorModule,
    ChatModule,
    PdfRagModule,
    PdfGeneratorModule,
    ImageReaderModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
