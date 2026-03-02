import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AskDocumentDto {
  @IsMongoId()
  documentId!: string;

  @IsString()
  @MaxLength(5000)
  question!: string;

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
}