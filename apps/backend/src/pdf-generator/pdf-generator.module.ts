import { Module } from '@nestjs/common';

import { GeminiModule } from '../gemini/gemini.module';
import { PdfGeneratorController } from './pdf-generator.controller';
import { PdfGeneratorService } from './pdf-generator.service';

@Module({
  imports: [GeminiModule],
  controllers: [PdfGeneratorController],
  providers: [PdfGeneratorService],
})
export class PdfGeneratorModule {}