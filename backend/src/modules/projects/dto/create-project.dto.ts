import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { AspectRatio } from '@ai-video-editor/shared';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['16:9', '9:16', '1:1', '4:5'])
  @IsNotEmpty()
  aspectRatio: AspectRatio;

  @IsOptional()
  resolution?: { width: number; height: number };
}

