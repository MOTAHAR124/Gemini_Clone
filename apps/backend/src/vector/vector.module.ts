import { Module } from '@nestjs/common';

import { EmbeddingModule } from '../embedding/embedding.module';
import { VectorService } from './vector.service';

@Module({
  imports: [EmbeddingModule],
  providers: [VectorService],
  exports: [VectorService],
})
export class VectorModule {}