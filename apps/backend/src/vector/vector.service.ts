import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';

import { EmbeddingService } from '../embedding/embedding.service';

interface UpsertVectorInput {
  id: string;
  userId: string;
  documentId: string;
  text: string;
  chunkIndex: number;
  vector: number[];
}

@Injectable()
export class VectorService implements OnModuleInit {
  private readonly client: QdrantClient;
  private readonly collectionName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly embeddingService: EmbeddingService,
  ) {
    this.client = new QdrantClient({
      url: configService.get<string>('vector.qdrantUrl'),
    });
    this.collectionName = configService.get<string>('vector.collection', 'rag_chunks');
  }

  async onModuleInit(): Promise<void> {
    const collections = await this.client.getCollections();
    const hasCollection = collections.collections.some((item) => item.name === this.collectionName);

    if (!hasCollection) {
      const size = await this.embeddingService.getVectorSize();
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size,
          distance: 'Cosine',
        },
      });
    }
  }

  async upsertChunks(chunks: UpsertVectorInput[]): Promise<void> {
    if (!chunks.length) {
      return;
    }

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: chunks.map((chunk) => ({
        id: chunk.id,
        vector: chunk.vector,
        payload: {
          userId: chunk.userId,
          documentId: chunk.documentId,
          text: chunk.text,
          chunkIndex: chunk.chunkIndex,
        },
      })),
    });
  }

  async search(input: {
    userId: string;
    documentId: string;
    queryVector: number[];
    limit: number;
    scoreThreshold?: number;
  }) {
    return this.client.search(this.collectionName, {
      vector: input.queryVector,
      limit: input.limit,
      score_threshold: input.scoreThreshold ?? 0.42,
      filter: {
        must: [
          {
            key: 'userId',
            match: {
              value: input.userId,
            },
          },
          {
            key: 'documentId',
            match: {
              value: input.documentId,
            },
          },
        ],
      },
      with_payload: true,
      with_vector: false,
    });
  }

  async deleteByDocument(userId: string, documentId: string): Promise<void> {
    await this.client.delete(this.collectionName, {
      filter: {
        must: [
          {
            key: 'userId',
            match: {
              value: userId,
            },
          },
          {
            key: 'documentId',
            match: {
              value: documentId,
            },
          },
        ],
      },
      wait: true,
    });
  }
}
