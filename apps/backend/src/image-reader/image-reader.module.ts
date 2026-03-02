import { Module } from '@nestjs/common';

import { GeminiModule } from '../gemini/gemini.module';
import { ImageReaderController } from './image-reader.controller';
import { ImageReaderService } from './image-reader.service';

@Module({
  imports: [GeminiModule],
  controllers: [ImageReaderController],
  providers: [ImageReaderService],
})
export class ImageReaderModule {}