import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AspectRatio } from '@ai-video-editor/shared';

interface GenerateScriptDto {
  topic: string;
}

interface GenerateVideoDto {
  topic: string;
  aspectRatio?: AspectRatio;
}

@Controller('generate')
@UseGuards(JwtAuthGuard)
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Post('script')
  async generateScript(@Request() req, @Body() dto: GenerateScriptDto) {
    return this.generatorService.generateScript(dto.topic);
  }

  @Post('video')
  async generateVideo(@Request() req, @Body() dto: GenerateVideoDto) {
    return this.generatorService.generateFacelessVideo(
      req.user.id,
      dto.topic,
      dto.aspectRatio,
    );
  }
}

