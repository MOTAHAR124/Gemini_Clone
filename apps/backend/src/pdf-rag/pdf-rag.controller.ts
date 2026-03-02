import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { AskDocumentDto } from './dto/ask-document.dto';
import { PdfRagService } from './pdf-rag.service';

@Controller('pdf-rag')
@UseGuards(JwtAuthGuard)
export class PdfRagController {
  constructor(private readonly pdfRagService: PdfRagService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  uploadPdf(@CurrentUser() user: CurrentUserData, @UploadedFile() file: Express.Multer.File) {
    return this.pdfRagService.uploadPdf(user.sub, file);
  }

  @Get('documents')
  listDocuments(@CurrentUser() user: CurrentUserData) {
    return this.pdfRagService.listDocuments(user.sub);
  }

  @Delete('documents/:id')
  deleteDocument(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.pdfRagService.deleteDocument(user.sub, id);
  }

  @Post('ask')
  askQuestion(@CurrentUser() user: CurrentUserData, @Body() dto: AskDocumentDto) {
    return this.pdfRagService.askQuestion(user.sub, dto);
  }
}