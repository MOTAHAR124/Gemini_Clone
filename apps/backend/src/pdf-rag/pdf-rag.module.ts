import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmbeddingModule } from '../embedding/embedding.module';
import { GeminiModule } from '../gemini/gemini.module';
import { VectorModule } from '../vector/vector.module';
import { PdfRagController } from './pdf-rag.controller';
import { PdfRagService } from './pdf-rag.service';
import { DocumentRecord, DocumentRecordSchema } from './schemas/document-record.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocumentRecord.name, schema: DocumentRecordSchema }]),
    EmbeddingModule,
    VectorModule,
    GeminiModule,
  ],
  controllers: [PdfRagController],
  providers: [PdfRagService],
})
export class PdfRagModule {}