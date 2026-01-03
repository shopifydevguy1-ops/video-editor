import { Controller, Post, Get, UseGuards, Body, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { TTSService } from './tts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TTSRequestDto } from './dto/tts-request.dto';

@Controller('tts')
@UseGuards(JwtAuthGuard)
export class TTSController {
  constructor(private readonly ttsService: TTSService) {}

  @Post('generate')
  generate(@Request() req: ExpressRequest & { user: { id: string } }, @Body() ttsRequest: TTSRequestDto) {
    return this.ttsService.generateSpeech(req.user.id, ttsRequest);
  }

  @Get('voices')
  getVoices() {
    return this.ttsService.getVoices();
  }
}

