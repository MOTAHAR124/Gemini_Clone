import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ trim: true })
  name!: string;

  @Prop()
  passwordHash?: string;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop()
  avatarUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);