import { BadRequestException, Injectable } from '@nestjs/common';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import puppeteer from 'puppeteer';

import { GeminiService } from '../gemini/gemini.service';
import { SYSTEM_PROMPTS } from '../gemini/prompts';
import { DownloadPdfDto } from './dto/download-pdf.dto';
import { GeneratePdfDto } from './dto/generate-pdf.dto';

@Injectable()
export class PdfGeneratorService {
  constructor(private readonly geminiService: GeminiService) {}

  async generatePreview(dto: GeneratePdfDto) {
    const markdown = await this.geminiService.generateText({
      systemPrompt: SYSTEM_PROMPTS.pdfGenerator,
      messages: [{ role: 'user', content: dto.prompt }],
      temperature: dto.temperature ?? 0.2,
      maxOutputTokens: dto.maxOutputTokens ?? 2500,
    });

    const html = this.buildFullHtml(markdown);

    return {
      markdown,
      html,
    };
  }

  async renderPdf(dto: DownloadPdfDto): Promise<Buffer> {
    const html = dto.html?.trim()
      ? this.wrapIfNeeded(dto.html)
      : dto.markdown?.trim()
        ? this.buildFullHtml(dto.markdown)
        : null;

    if (!html) {
      throw new BadRequestException('Provide html or markdown to generate PDF');
    }

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '16mm',
          right: '14mm',
          bottom: '16mm',
          left: '14mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private buildFullHtml(markdown: string): string {
    const rawHtml = marked.parse(markdown) as string;
    const safeHtml = sanitizeHtml(rawHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td']),
      allowedAttributes: {
        '*': ['style'],
      },
      allowedStyles: {
        '*': {
          color: [/^.*$/],
          'font-size': [/^.*$/],
          'text-align': [/^left|right|center|justify$/],
        },
      },
    });

    return this.wrapIfNeeded(safeHtml);
  }

  private wrapIfNeeded(innerHtml: string): string {
    if (innerHtml.includes('<html')) {
      return innerHtml;
    }

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #17212f;
        line-height: 1.5;
      }
      h1, h2, h3 {
        color: #0f172a;
        margin: 0.6rem 0;
      }
      p {
        margin: 0.4rem 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 0.8rem 0;
      }
      th, td {
        border: 1px solid #d5dde8;
        padding: 8px;
        text-align: left;
      }
      thead {
        background: #edf2f7;
      }
      .header {
        border-bottom: 2px solid #d5dde8;
        padding-bottom: 8px;
        margin-bottom: 10px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <strong>AI Document</strong>
    </div>
    ${innerHtml}
  </body>
</html>`;
  }
}