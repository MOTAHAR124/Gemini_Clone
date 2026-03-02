import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import multer from 'multer';

import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { RenameConversationDto } from './dto/rename-conversation.dto';
import { SendAttachmentMessageDto } from './dto/send-attachment-message.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  createConversation(@CurrentUser() user: CurrentUserData, @Body() dto: CreateConversationDto) {
    return this.chatService.createConversation(user.sub, dto);
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  listConversations(@CurrentUser() user: CurrentUserData) {
    return this.chatService.listConversations(user.sub);
  }

  @Patch('conversations/:id')
  @UseGuards(JwtAuthGuard)
  renameConversation(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: RenameConversationDto,
  ) {
    return this.chatService.renameConversation(user.sub, id, dto);
  }

  @Delete('conversations/:id')
  @UseGuards(JwtAuthGuard)
  deleteConversation(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.chatService.deleteConversation(user.sub, id);
  }

  @Post('conversations/:id/share')
  @UseGuards(JwtAuthGuard)
  shareConversation(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.chatService.shareConversation(user.sub, id);
  }

  @Get('shared/:token')
  getSharedConversation(@Param('token') token: string) {
    return this.chatService.getSharedConversation(token);
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  listMessages(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.chatService.listMessages(user.sub, id);
  }

  @Post('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  sendMessage(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user.sub, id, dto);
  }

  @Post('conversations/:id/attachments')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 6, {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  sendMessageWithAttachments(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: SendAttachmentMessageDto,
  ) {
    return this.chatService.sendMessageWithAttachments(user.sub, id, dto, files ?? []);
  }

  @Post('conversations/:id/stream')
  @UseGuards(JwtAuthGuard)
  async streamMessage(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      const result = await this.chatService.streamMessage(user.sub, id, dto, (chunk) => {
        const payload = JSON.stringify({ type: 'chunk', content: chunk });
        res.write(`data: ${payload}\n\n`);
      });

      res.write(`data: ${JSON.stringify({ type: 'done', message: result.assistantText, id: result.assistantMessageId })}\n\n`);
      res.end();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
      res.end();
    }
  }
}
