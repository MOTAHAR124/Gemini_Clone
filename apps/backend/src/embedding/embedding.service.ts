import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private extractor: any;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    this.modelName = configService.get<string>('rag.embeddingModel', 'Xenova/all-MiniLM-L6-v2');
  }

  async onModuleInit(): Promise<void> {
    await this.ensureExtractor();
  }

  async embedText(input: string): Promise<number[]> {
    const extractor = await this.ensureExtractor();
    const normalized = input.replace(/\s+/g, ' ').trim();
    const output = await extractor(normalized, {
      pooling: 'mean',
      normalize: true,
    });

    return Array.from(output.data) as number[];
  }

  async embedBatch(inputs: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of inputs) {
      embeddings.push(await this.embedText(text));
    }
    return embeddings;
  }

  async getVectorSize(): Promise<number> {
    const vector = await this.embedText('vector-size-probe');
    return vector.length;
  }

  private async ensureExtractor() {
    if (this.extractor) {
      return this.extractor;
    }

    const transformers = await import('@xenova/transformers');
    this.extractor = await transformers.pipeline('feature-extraction', this.modelName);
    return this.extractor;
  }
}