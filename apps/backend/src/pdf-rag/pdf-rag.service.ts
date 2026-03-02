import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PDFParse } from 'pdf-parse';
import { randomUUID } from 'crypto';

import { chunkText } from '../common/utils/chunking.utils';
import { EmbeddingService } from '../embedding/embedding.service';
import { GeminiService } from '../gemini/gemini.service';
import { SYSTEM_PROMPTS } from '../gemini/prompts';
import { VectorService } from '../vector/vector.service';
import { AskDocumentDto } from './dto/ask-document.dto';
import { DocumentRecord, DocumentRecordDocument } from './schemas/document-record.schema';

@Injectable()
export class PdfRagService {
  private readonly maxContextChunks: number;

  constructor(
    @InjectModel(DocumentRecord.name)
    private readonly documentModel: Model<DocumentRecordDocument>,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorService: VectorService,
    private readonly geminiService: GeminiService,
    configService: ConfigService,
  ) {
    this.maxContextChunks = configService.get<number>('rag.maxContextChunks', 6);
  }

  async uploadPdf(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('PDF file is required');
    }

    if (!file.mimetype.includes('pdf')) {
      throw new BadRequestException('Only PDF files are supported');
    }

    const record = await this.documentModel.create({
      userId: new Types.ObjectId(userId),
      fileName: file.originalname,
      status: 'processing',
    });

    const parser = new PDFParse({ data: file.buffer });
    try {
      const parsed = await parser.getText();
      const chunks = chunkText(parsed.text, 1400, 240);

      if (!chunks.length) {
        throw new BadRequestException('No extractable text found in this PDF');
      }

      const vectors = await this.embeddingService.embedBatch(chunks.map((chunk) => chunk.text));

      await this.vectorService.upsertChunks(
        chunks.map((chunk, index) => ({
          id: randomUUID(),
          userId,
          documentId: record._id.toString(),
          text: chunk.text,
          chunkIndex: chunk.index,
          vector: vectors[index],
        })),
      );

      record.status = 'ready';
      record.pageCount = parsed.total ?? 0;
      record.chunkCount = chunks.length;
      await record.save();

      return this.serializeDocument(record);
    } catch (error) {
      record.status = 'failed';
      record.errorMessage = error instanceof Error ? error.message : 'Failed to process PDF';
      await record.save();
      throw error;
    } finally {
      await parser.destroy();
    }
  }

  async listDocuments(userId: string) {
    const documents = await this.documentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return documents.map((document) => ({
      id: document._id.toString(),
      fileName: document.fileName,
      status: document.status,
      pageCount: document.pageCount,
      chunkCount: document.chunkCount,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      errorMessage: document.errorMessage,
    }));
  }

  async deleteDocument(userId: string, documentId: string) {
    const deleted = await this.documentModel
      .findOneAndDelete({
        _id: new Types.ObjectId(documentId),
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!deleted) {
      throw new NotFoundException('Document not found');
    }

    await this.vectorService.deleteByDocument(userId, documentId);

    return { success: true };
  }

  async askQuestion(userId: string, dto: AskDocumentDto) {
    const document = await this.documentModel
      .findOne({
        _id: new Types.ObjectId(dto.documentId),
        userId: new Types.ObjectId(userId),
        status: 'ready',
      })
      .exec();

    if (!document) {
      throw new NotFoundException('Document not found or still processing');
    }

    const queryVector = await this.embeddingService.embedText(dto.question);
    const hits = await this.vectorService.search({
      userId,
      documentId: dto.documentId,
      queryVector,
      limit: this.maxContextChunks,
      scoreThreshold: 0.42,
    });

    if (!hits.length) {
      return {
        answer: 'Not found in document',
        citations: [],
      };
    }

    const contextSnippets = hits
      .map((hit, idx) => {
        const payload = (hit.payload ?? {}) as {
          text?: string;
          chunkIndex?: number;
        };
        return {
          rank: idx + 1,
          score: hit.score,
          chunkIndex: payload.chunkIndex,
          text: payload.text ?? '',
        };
      })
      .filter((item) => item.text.length > 0);

    if (!contextSnippets.length) {
      return {
        answer: 'Not found in document',
        citations: [],
      };
    }

    const contextBlock = contextSnippets
      .map((item) => `Chunk ${item.chunkIndex} (score: ${item.score.toFixed(3)}):\n${item.text}`)
      .join('\n\n---\n\n');

    // System prompt enforces context-only behavior; answer should never rely on external knowledge.
    const answer = await this.geminiService.generateText({
      systemPrompt: SYSTEM_PROMPTS.rag,
      messages: [
        {
          role: 'user',
          content: `Context:\n${contextBlock}\n\nQuestion:\n${dto.question}`,
        },
      ],
      temperature: dto.temperature ?? 0,
      maxOutputTokens: dto.maxOutputTokens ?? 1200,
    });

    const normalized = answer.trim() || 'Not found in document';

    return {
      answer: normalized,
      citations: contextSnippets.map((snippet) => ({
        chunkIndex: snippet.chunkIndex,
        score: Number(snippet.score.toFixed(4)),
        preview: snippet.text.slice(0, 240),
      })),
    };
  }

  private serializeDocument(document: DocumentRecordDocument) {
    return {
      id: document._id.toString(),
      fileName: document.fileName,
      status: document.status,
      pageCount: document.pageCount,
      chunkCount: document.chunkCount,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      errorMessage: document.errorMessage,
    };
  }
}
