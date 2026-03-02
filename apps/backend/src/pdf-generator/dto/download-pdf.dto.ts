import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DownloadPdfDto {
  @IsOptional()
  @IsString()
  @MaxLength(250000)
  markdown?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250000)
  html?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  fileName?: string;
}