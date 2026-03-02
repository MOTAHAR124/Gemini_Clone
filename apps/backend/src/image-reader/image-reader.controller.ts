import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyzeImageDto } from './dto/analyze-image.dto';
import { ImageReaderService } from './image-reader.service';

@Controller('image-reader')
@UseGuards(JwtAuthGuard)
export class ImageReaderController {
  constructor(private readonly imageReaderService: ImageReaderService) {}

  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 12 * 1024 * 1024,
      },
    }),
  )
  analyze(@UploadedFile() file: Express.Multer.File, @Body() dto: AnalyzeImageDto) {
    return this.imageReaderService.analyze(file, dto);
  }
}