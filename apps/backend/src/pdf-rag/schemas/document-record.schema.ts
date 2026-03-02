import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DocumentRecordDocument = HydratedDocument<DocumentRecord>;

@Schema({ timestamps: true })
export class DocumentRecord {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  fileName!: string;

  @Prop({ required: true, enum: ['processing', 'ready', 'failed'], default: 'processing' })
  status!: 'processing' | 'ready' | 'failed';

  @Prop({ required: true, default: 0 })
  pageCount!: number;

  @Prop({ required: true, default: 0 })
  chunkCount!: number;

  @Prop()
  errorMessage?: string;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const DocumentRecordSchema = SchemaFactory.createForClass(DocumentRecord);
DocumentRecordSchema.index({ userId: 1, createdAt: -1 });
