import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class StartRenderDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsObject()
  @IsOptional()
  settings?: any;
}

