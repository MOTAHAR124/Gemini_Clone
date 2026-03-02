import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { extname } from 'path';
import { PDFParse } from 'pdf-parse';

import { truncateToTokenLimit, estimateTokenCount } from '../common/utils/token.utils';
import { GeminiService } from '../gemini/gemini.service';
import { ChatModelProfile, resolveModelCandidates, resolveModelDefaults } from '../gemini/model-routing';
import { SYSTEM_PROMPTS } from '../gemini/prompts';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { RenameConversationDto } from './dto/rename-conversation.dto';
import { SendAttachmentMessageDto } from './dto/send-attachment-message.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  private readonly maxHistoryMessages: number;
  private readonly defaultModel: string;

  constructor(
    @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    private readonly geminiService: GeminiService,
    configService: ConfigService,
  ) {
    this.maxHistoryMessages = configService.get<number>('rag.maxHistoryMessages', 24);
    this.defaultModel = configService.get<string>('gemini.model', 'gemini-3-flash-preview');
  }

  async createConversation(userId: string, dto: CreateConversationDto) {
    const conversation = await this.conversationModel.create({
      userId: new Types.ObjectId(userId),
      title: dto.title?.trim() || 'New Chat',
      lastMessageAt: new Date(),
    });

    return this.serializeConversation(conversation);
  }

  async listConversations(userId: string) {
    const conversations = await this.conversationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ lastMessageAt: -1 })
      .lean()
      .exec();

    if (conversations.length === 0) {
      return [];
    }

    const conversationIds = conversations.map((conversation) => conversation._id);
    const conversationIdsWithMessages = await this.messageModel
      .aggregate<{ _id: Types.ObjectId }>([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            conversationId: { $in: conversationIds },
          },
        },
        {
          $group: {
            _id: '$conversationId',
          },
        },
      ])
      .exec();

    const nonEmptyConversationIdSet = new Set(
      conversationIdsWithMessages.map((item) => item._id.toString()),
    );

    return conversations
      .filter((conversation) =>
        nonEmptyConversationIdSet.has(conversation._id.toString()),
      )
      .map((conversation) => ({
      id: conversation._id.toString(),
      title: conversation.title,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      }));
  }

  async renameConversation(userId: string, conversationId: string, dto: RenameConversationDto) {
    const conversation = await this.conversationModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(conversationId), userId: new Types.ObjectId(userId) },
        { title: dto.title.trim() },
        { new: true },
      )
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.serializeConversation(conversation);
  }

  async deleteConversation(userId: string, conversationId: string) {
    const conversation = await this.conversationModel
      .findOneAndDelete({
        _id: new Types.ObjectId(conversationId),
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    await this.messageModel
      .deleteMany({
        conversationId: new Types.ObjectId(conversationId),
        userId: new Types.ObjectId(userId),
      })
      .exec();

    return { success: true };
  }

  async shareConversation(userId: string, conversationId: string) {
    const conversation = await this.ensureConversationOwnership(userId, conversationId);
    if (conversation.shareToken) {
      return { shareToken: conversation.shareToken };
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const shareToken = randomBytes(18).toString('base64url');
      const updated = await this.conversationModel
        .findOneAndUpdate(
          {
            _id: conversation._id,
            userId: new Types.ObjectId(userId),
            shareToken: { $exists: false },
          },
          { shareToken },
          { new: true },
        )
        .exec();

      if (updated?.shareToken) {
        return { shareToken: updated.shareToken };
      }

      const refreshed = await this.ensureConversationOwnership(userId, conversationId);
      if (refreshed.shareToken) {
        return { shareToken: refreshed.shareToken };
      }
    }

    throw new BadRequestException('Failed to create share link');
  }

  async getSharedConversation(shareToken: string) {
    const trimmedToken = shareToken.trim();
    if (!trimmedToken) {
      throw new NotFoundException('Shared conversation not found');
    }

    const conversation = await this.conversationModel.findOne({ shareToken: trimmedToken }).lean().exec();
    if (!conversation) {
      throw new NotFoundException('Shared conversation not found');
    }

    const messages = await this.messageModel
      .find({
        conversationId: conversation._id,
      })
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    return {
      id: conversation._id.toString(),
      title: conversation.title,
      updatedAt: conversation.updatedAt,
      messages: messages.map((message) => ({
        id: message._id.toString(),
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
      })),
    };
  }

  async listMessages(userId: string, conversationId: string) {
    await this.ensureConversationOwnership(userId, conversationId);

    const messages = await this.messageModel
      .find({
        conversationId: new Types.ObjectId(conversationId),
        userId: new Types.ObjectId(userId),
      })
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    return messages.map((message) => ({
      id: message._id.toString(),
      role: message.role,
      content: message.content,
      tokens: message.tokens,
      createdAt: message.createdAt,
    }));
  }

  async sendMessage(userId: string, conversationId: string, dto: SendMessageDto) {
    const userText = dto.message.trim();
    if (!userText) {
      throw new BadRequestException('Message is required');
    }

    const { assistantText } = await this.generateAssistantResponse(userId, conversationId, {
      storedUserText: userText,
      modelUserText: userText,
      temperature: dto.temperature,
      maxOutputTokens: dto.maxOutputTokens,
      modelProfile: dto.modelProfile,
    });
    return { message: assistantText };
  }

  async sendMessageWithAttachments(
    userId: string,
    conversationId: string,
    dto: SendAttachmentMessageDto,
    files: Express.Multer.File[],
  ) {
    const userText = dto.message?.trim() ?? '';
    if (!userText && files.length === 0) {
      throw new BadRequestException('Message or attachment is required');
    }

    const attachmentContext = await this.buildAttachmentContext(files, userText);
    if (!userText && !attachmentContext) {
      throw new BadRequestException('No readable content found in attachments');
    }

    const fallbackText = files.length > 0 ? `Analyze attached file${files.length > 1 ? 's' : ''}.` : userText;
    const storedUserText = userText || fallbackText;
    const modelUserText = attachmentContext
      ? `${storedUserText}\n\nAttachment context:\n${attachmentContext}`
      : storedUserText;

    const { assistantText } = await this.generateAssistantResponse(userId, conversationId, {
      storedUserText,
      modelUserText,
      temperature: dto.temperature,
      maxOutputTokens: dto.maxOutputTokens,
      modelProfile: dto.modelProfile,
    });

    return { message: assistantText };
  }

  async streamMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
    onToken: (chunk: string) => void,
  ) {
    const userText = dto.message.trim();
    if (!userText) {
      throw new BadRequestException('Message is required');
    }

    return this.generateAssistantResponse(userId, conversationId, {
      storedUserText: userText,
      modelUserText: userText,
      temperature: dto.temperature,
      maxOutputTokens: dto.maxOutputTokens,
      modelProfile: dto.modelProfile,
      onToken,
    });
  }

  private async generateAssistantResponse(
    userId: string,
    conversationId: string,
    input: {
      storedUserText: string;
      modelUserText: string;
      temperature?: number;
      maxOutputTokens?: number;
      modelProfile?: ChatModelProfile;
      onToken?: (chunk: string) => void;
    },
  ) {
    const conversation = await this.ensureConversationOwnership(userId, conversationId);
    const storedUserText = input.storedUserText.trim();
    const modelUserText = truncateToTokenLimit(input.modelUserText.trim(), 6000);
    if (!storedUserText || !modelUserText) {
      throw new BadRequestException('Message is required');
    }

    await this.messageModel.create({
      conversationId: new Types.ObjectId(conversationId),
      userId: new Types.ObjectId(userId),
      role: 'user',
      content: storedUserText,
      tokens: estimateTokenCount(storedUserText),
    });

    const contextMessages = await this.getModelHistory(userId, conversationId);
    const latestUserIndex = [...contextMessages].reverse().findIndex((message) => message.role === 'user');
    if (latestUserIndex >= 0) {
      const actualIndex = contextMessages.length - 1 - latestUserIndex;
      contextMessages[actualIndex] = {
        ...contextMessages[actualIndex],
        content: modelUserText,
      };
    }

    const defaults = resolveModelDefaults(input.modelProfile);
    const modelCandidates = resolveModelCandidates(input.modelProfile, this.defaultModel);
    const temperature = input.temperature ?? defaults.temperature;
    const maxOutputTokens = input.maxOutputTokens ?? defaults.maxOutputTokens;

    const assistantText = input.onToken
      ? await this.geminiService.streamText({
          systemPrompt: SYSTEM_PROMPTS.chat,
          messages: contextMessages,
          modelCandidates,
          temperature,
          maxOutputTokens,
          onChunk: input.onToken,
        })
      : await this.geminiService.generateText({
          systemPrompt: SYSTEM_PROMPTS.chat,
          messages: contextMessages,
          modelCandidates,
          temperature,
          maxOutputTokens,
        });

    const assistantMessage = await this.messageModel.create({
      conversationId: new Types.ObjectId(conversationId),
      userId: new Types.ObjectId(userId),
      role: 'assistant',
      content: assistantText,
      tokens: estimateTokenCount(assistantText),
    });

    const title = conversation.title === 'New Chat' ? this.buildTitleFromMessage(storedUserText) : conversation.title;
    await this.conversationModel
      .findByIdAndUpdate(conversationId, {
        title,
        lastMessageAt: new Date(),
      })
      .exec();

    return {
      assistantText,
      assistantMessageId: assistantMessage._id.toString(),
    };
  }

  private async buildAttachmentContext(files: Express.Multer.File[], question: string) {
    if (!files.length) {
      return '';
    }

    const sections: string[] = [];
    for (const file of files.slice(0, 6)) {
      const safeName = file.originalname || 'attachment';

      try {
        if (this.isPdf(file)) {
          const pdfText = await this.extractPdfText(file);
          if (pdfText) {
            sections.push(
              this.formatAttachmentSection(safeName, 'PDF', truncateToTokenLimit(this.normalizeText(pdfText), 2500)),
            );
          }
          continue;
        }

        if (this.isImage(file)) {
          const analyzed = await this.geminiService.analyzeImage({
            systemPrompt: SYSTEM_PROMPTS.imageReader,
            question: question || 'Describe this image and extract all readable text.',
            mimeType: file.mimetype,
            imageBase64: file.buffer.toString('base64'),
            temperature: 0.1,
            maxOutputTokens: 1200,
          });
          if (analyzed.trim()) {
            sections.push(
              this.formatAttachmentSection(safeName, 'Image', truncateToTokenLimit(this.normalizeText(analyzed), 1200)),
            );
          }
          continue;
        }

        if (this.isTextLike(file)) {
          const text = file.buffer.toString('utf-8');
          if (text.trim()) {
            sections.push(
              this.formatAttachmentSection(safeName, 'Text', truncateToTokenLimit(this.normalizeText(text), 1800)),
            );
          }
          continue;
        }

        sections.push(this.formatAttachmentSection(safeName, 'Unsupported', 'Could not read this file type.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process file';
        sections.push(this.formatAttachmentSection(safeName, 'Error', message));
      }
    }

    return truncateToTokenLimit(sections.join('\n\n---\n\n'), 6000);
  }

  private async extractPdfText(file: Express.Multer.File) {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const parsed = await parser.getText();
      return parsed.text ?? '';
    } finally {
      await parser.destroy();
    }
  }

  private isPdf(file: Express.Multer.File) {
    const mime = file.mimetype?.toLowerCase() ?? '';
    const ext = extname(file.originalname ?? '').toLowerCase();
    return mime.includes('pdf') || ext === '.pdf';
  }

  private isImage(file: Express.Multer.File) {
    const mime = file.mimetype?.toLowerCase() ?? '';
    return mime.includes('png') || mime.includes('jpg') || mime.includes('jpeg');
  }

  private isTextLike(file: Express.Multer.File) {
    const mime = file.mimetype?.toLowerCase() ?? '';
    const ext = extname(file.originalname ?? '').toLowerCase();
    return (
      mime.startsWith('text/') ||
      mime.includes('json') ||
      mime.includes('csv') ||
      mime.includes('xml') ||
      ['.txt', '.md', '.csv', '.json', '.xml', '.log'].includes(ext)
    );
  }

  private formatAttachmentSection(fileName: string, type: string, content: string) {
    return `File: ${fileName}\nType: ${type}\nContent:\n${content}`;
  }

  private normalizeText(input: string) {
    return input.replace(/\u0000/g, '').replace(/\r/g, '').trim();
  }

  private async getModelHistory(userId: string, conversationId: string) {
    const messages = await this.messageModel
      .find({
        conversationId: new Types.ObjectId(conversationId),
        userId: new Types.ObjectId(userId),
      })
      .sort({ createdAt: -1 })
      .limit(this.maxHistoryMessages)
      .lean()
      .exec();

    // Keep only recent turns and trim each message so model context stays within safe bounds.
    return messages
      .reverse()
      .map((message) => ({
        role: message.role,
        content: truncateToTokenLimit(message.content, 1200),
      }))
      .filter((message) => message.role !== 'system');
  }

  private buildTitleFromMessage(content: string): string {
    const raw = content.replace(/\s+/g, ' ').trim();
    const cut = raw.length > 60 ? `${raw.slice(0, 57)}...` : raw;
    return cut || 'New Chat';
  }

  private async ensureConversationOwnership(userId: string, conversationId: string) {
    const conversation = await this.conversationModel
      .findOne({
        _id: new Types.ObjectId(conversationId),
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  private serializeConversation(conversation: ConversationDocument) {
    return {
      id: conversation._id.toString(),
      title: conversation.title,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }
}
