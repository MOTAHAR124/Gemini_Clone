import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class GeneratePdfDto {
  @IsString()
  @MaxLength(5000)
  prompt!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(128)
  @Max(4096)
  maxOutputTokens?: number;
}