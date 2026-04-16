import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FeatureExtractionPipeline } from '@xenova/transformers';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private extractor?: FeatureExtractionPipeline;
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

    return Array.from(output.data as ArrayLike<number>);
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

  private async ensureExtractor(): Promise<FeatureExtractionPipeline> {
    if (this.extractor) {
      return this.extractor;
    }

    const transformers = await import('@xenova/transformers');
    const extractor = await transformers.pipeline('feature-extraction', this.modelName);
    this.extractor = extractor;
    return extractor;
  }
}
