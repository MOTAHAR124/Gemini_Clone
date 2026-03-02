import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DownloadPdfDto } from './dto/download-pdf.dto';
import { GeneratePdfDto } from './dto/generate-pdf.dto';
import { PdfGeneratorService } from './pdf-generator.service';

@Controller('pdf-generator')
@UseGuards(JwtAuthGuard)
export class PdfGeneratorController {
  constructor(private readonly pdfGeneratorService: PdfGeneratorService) {}

  @Post('preview')
  preview(@Body() dto: GeneratePdfDto) {
    return this.pdfGeneratorService.generatePreview(dto);
  }

  @Post('download')
  async download(@Body() dto: DownloadPdfDto, @Res() res: Response) {
    const buffer = await this.pdfGeneratorService.renderPdf(dto);
    const fileName = (dto.fileName || 'document').replace(/[^a-zA-Z0-9-_]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
    res.send(buffer);
  }
}