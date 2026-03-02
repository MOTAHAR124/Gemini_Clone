import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ChatModelProfile } from '../../gemini/model-routing';

export class SendAttachmentMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  message?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(64)
  @Max(4096)
  maxOutputTokens?: number;

  @IsOptional()
  @IsIn(['fast', 'thinking', 'pro'])
  modelProfile?: ChatModelProfile;
}
