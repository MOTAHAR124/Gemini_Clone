import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  title!: string;

  @Prop({ type: Date, default: Date.now, index: true })
  lastMessageAt!: Date;

  @Prop({ type: String, unique: true, sparse: true, index: true })
  shareToken?: string;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ userId: 1, lastMessageAt: -1 });
