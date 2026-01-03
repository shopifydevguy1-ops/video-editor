import { Controller, Post, Get, UseGuards, Body, Request } from '@nestjs/common';
import { TTSService } from './tts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TTSRequestDto } from './dto/tts-request.dto';

@Controller('tts')
@UseGuards(JwtAuthGuard)
export class TTSController {
  constructor(private readonly ttsService: TTSService) {}

  @Post('generate')
  generate(@Request() req, @Body() ttsRequest: TTSRequestDto) {
    return this.ttsService.generateSpeech(ttsRequest, req.user.id);
  }

  @Get('voices')
  getVoices() {
    return this.ttsService.getVoices();
  }
}

