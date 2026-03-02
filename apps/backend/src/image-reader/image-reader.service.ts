import { BadRequestException, Injectable } from '@nestjs/common';

import { GeminiService } from '../gemini/gemini.service';
import { SYSTEM_PROMPTS } from '../gemini/prompts';
import { AnalyzeImageDto } from './dto/analyze-image.dto';

@Injectable()
export class ImageReaderService {
  constructor(private readonly geminiService: GeminiService) {}

  async analyze(file: Express.Multer.File, dto: AnalyzeImageDto) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const mimeType = file.mimetype?.toLowerCase() ?? '';
    if (!(mimeType.includes('png') || mimeType.includes('jpg') || mimeType.includes('jpeg'))) {
      throw new BadRequestException('Only PNG and JPG images are supported');
    }

    const answer = await this.geminiService.analyzeImage({
      systemPrompt: SYSTEM_PROMPTS.imageReader,
      question: dto.question,
      mimeType: file.mimetype,
      imageBase64: file.buffer.toString('base64'),
      temperature: dto.temperature,
      maxOutputTokens: dto.maxOutputTokens,
    });

    return {
      answer,
    };
  }
}