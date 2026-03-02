import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  conversationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, enum: ['user', 'assistant', 'system'] })
  role!: 'user' | 'assistant' | 'system';

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true })
  tokens!: number;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ conversationId: 1, createdAt: 1 });
