import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GenerateTextInput {
  systemPrompt: string;
  messages: ChatMessageInput[];
  modelCandidates?: string[];
  temperature?: number;
  maxOutputTokens?: number;
}

interface StreamTextInput extends GenerateTextInput {
  onChunk: (chunk: string) => void;
}

interface ImagePromptInput {
  systemPrompt: string;
  question?: string;
  mimeType: string;
  imageBase64: string;
  temperature?: number;
  maxOutputTokens?: number;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly client: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new GoogleGenerativeAI(configService.get<string>('gemini.apiKey') ?? '');
    this.modelName = configService.get<string>('gemini.model', 'gemini-2.5-flash');
  }

  async generateText(input: GenerateTextInput): Promise<string> {
    const response = await this.withModelFallback(input.modelCandidates, async (modelName) =>
      this.withRetry(async () => {
        const model = this.client.getGenerativeModel({
          model: modelName,
          systemInstruction: input.systemPrompt,
        });

        const result = await model.generateContent({
          contents: this.toGeminiContents(input.messages),
          generationConfig: {
            temperature: input.temperature ?? 0.2,
            maxOutputTokens: input.maxOutputTokens ?? 2048,
          },
        });

        return result.response.text();
      }),
    );

    return response.trim();
  }

  async streamText(input: StreamTextInput): Promise<string> {
    return this.withModelFallback(input.modelCandidates, async (modelName) =>
      this.withRetry(async () => {
        const model = this.client.getGenerativeModel({
          model: modelName,
          systemInstruction: input.systemPrompt,
        });

        const streamResult = await model.generateContentStream({
          contents: this.toGeminiContents(input.messages),
          generationConfig: {
            temperature: input.temperature ?? 0.2,
            maxOutputTokens: input.maxOutputTokens ?? 2048,
          },
        });

        let fullText = '';
        for await (const chunk of streamResult.stream) {
          const text = chunk.text();
          if (text) {
            fullText += text;
            input.onChunk(text);
          }
        }

        return fullText.trim();
      }),
    );
  }

  async analyzeImage(input: ImagePromptInput): Promise<string> {
    const response = await this.withRetry(async () => {
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        systemInstruction: input.systemPrompt,
      });

      const question = input.question?.trim() || 'Describe this image and extract all readable text.';
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: question },
              {
                inlineData: {
                  mimeType: input.mimeType,
                  data: input.imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: input.temperature ?? 0.1,
          maxOutputTokens: input.maxOutputTokens ?? 2048,
        },
      });

      return result.response.text();
    });

    return response.trim();
  }

  private toGeminiContents(messages: ChatMessageInput[]) {
    return messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      }));
  }

  private async withModelFallback<T>(
    modelCandidates: string[] | undefined,
    fn: (modelName: string) => Promise<T>,
  ): Promise<T> {
    const candidates = [...new Set([...(modelCandidates ?? []), this.modelName].filter(Boolean))];
    let lastError: unknown;

    for (let index = 0; index < candidates.length; index += 1) {
      const modelName = candidates[index];
      try {
        const result = await fn(modelName);
        this.logger.log(
          index === 0
            ? `Gemini response model: ${modelName}`
            : `Gemini response model (fallback #${index}): ${modelName}`,
        );
        return result;
      } catch (error) {
        lastError = error;
        if (this.shouldFallbackToNextModel(error)) {
          const maybeError = error as { status?: number; message?: string };
          this.logger.warn(
            `Gemini model unavailable: ${modelName}; falling back. status=${maybeError?.status ?? 'unknown'} message="${maybeError?.message ?? 'Unknown error'}"`,
          );
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }

  private async withRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
    let attempt = 0;
    let lastError: unknown;

    while (attempt < maxAttempts) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        attempt += 1;

        if (!this.isRetriableError(error) || attempt >= maxAttempts) {
          throw error;
        }

        const delayMs = Math.min(1000 * 2 ** attempt, 8000);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw lastError;
  }

  private isRetriableError(error: unknown): boolean {
    const maybeError = error as { status?: number; message?: string };
    if (maybeError?.status === 429) {
      return true;
    }

    const message = maybeError?.message?.toLowerCase() ?? '';
    return message.includes('rate limit') || message.includes('429');
  }

  private shouldFallbackToNextModel(error: unknown): boolean {
    const maybeError = error as { status?: number; message?: string };
    const status = maybeError?.status;
    const message = maybeError?.message?.toLowerCase() ?? '';

    if (status === 404 || status === 403 || status === 429) {
      return true;
    }

    return (
      message.includes('model') &&
      (message.includes('not found') ||
        message.includes('not available') ||
        message.includes('not supported') ||
        message.includes('permission') ||
        message.includes('quota'))
    );
  }
}
