import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class TTSRequestDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  voiceId: string;

  @IsNumber()
  @IsOptional()
  @Min(0.5)
  @Max(2.0)
  speed?: number;

  @IsNumber()
  @IsOptional()
  @Min(-20)
  @Max(20)
  pitch?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  stability?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  similarityBoost?: number;

  @IsString()
  @IsOptional()
  format?: 'mp3' | 'wav' | 'ogg';
}

