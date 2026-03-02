import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';

interface CreateLocalUserInput {
  email: string;
  name: string;
  passwordHash: string;
}

interface UpsertGoogleUserInput {
  email: string;
  name: string;
  googleId: string;
  avatarUrl?: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async createLocalUser(input: CreateLocalUserInput): Promise<UserDocument> {
    const created = new this.userModel({
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash: input.passwordHash,
    });
    return created.save();
  }

  async upsertGoogleUser(input: UpsertGoogleUserInput): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: input.email.toLowerCase() }).exec();
    if (existing) {
      existing.googleId = input.googleId;
      if (input.avatarUrl) {
        existing.avatarUrl = input.avatarUrl;
      }
      existing.name = input.name || existing.name;
      return existing.save();
    }

    const created = new this.userModel({
      email: input.email.toLowerCase(),
      name: input.name,
      googleId: input.googleId,
      avatarUrl: input.avatarUrl,
    });
    return created.save();
  }
}
