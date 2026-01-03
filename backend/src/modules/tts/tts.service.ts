import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { TTSRequestDto } from './dto/tts-request.dto';
import { TTSResponse, WordTimestamp } from '@ai-video-editor/shared';

@Injectable()
export class TTSService {
  private readonly logger = new Logger(TTSService.name);
  private readonly elevenLabsApiKey: string;
  private readonly elevenLabsApiUrl = 'https://api.elevenlabs.io/v1';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.elevenLabsApiKey = this.configService.get<string>('ELEVENLABS_API_KEY') || '';
  }

  async generateSpeech(
    userId: string,
    request: TTSRequestDto,
  ): Promise<TTSResponse> {
    // Generate cache key
    const cacheKey = this.generateCacheKey(request);

    // Check cache first
    const cached = await this.prisma.tTSCache.findUnique({
      where: { textHash: cacheKey },
    });

    if (cached) {
      this.logger.log(`Cache hit for TTS request: ${cacheKey.substring(0, 8)}...`);
      return {
        audioUrl: cached.audioUrl,
        duration: cached.duration,
        wordTimestamps: (cached.wordTimestamps as any) as WordTimestamp[],
        voiceId: cached.voiceId,
        text: request.text,
      };
    }

    // Generate new audio
    if (!this.elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const audioData = await this.generateWithElevenLabs(request);
      
      // Upload to storage (S3/R2) - placeholder for now
      const audioUrl = await this.uploadAudio(audioData, userId, request);

      // Extract word timestamps (ElevenLabs provides this)
      const wordTimestamps = await this.extractWordTimestamps(
        request.text,
        audioData,
      );

      // Calculate duration
      const duration = this.calculateDuration(audioData);

      // Cache the result
      await this.prisma.tTSCache.create({
        data: {
          userId,
          textHash: cacheKey,
          voiceId: request.voiceId,
          audioUrl,
          duration,
          wordTimestamps: wordTimestamps as any,
        },
      });

      return {
        audioUrl,
        duration,
        wordTimestamps,
        voiceId: request.voiceId,
        text: request.text,
      };
    } catch (error: any) {
      this.logger.error(`TTS generation failed: ${error.message}`, error.stack);
      throw new Error(`Failed to generate speech: ${error.message}`);
    }
  }

  async getVoices() {
    if (!this.elevenLabsApiKey) {
      return this.getDefaultVoices();
    }

    try {
      const response = await axios.get(`${this.elevenLabsApiUrl}/voices`, {
        headers: {
          'xi-api-key': this.elevenLabsApiKey,
        },
      });

      return response.data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        provider: 'elevenlabs' as const,
        language: 'en', // ElevenLabs doesn't provide language in API
        gender: voice.labels?.gender || 'neutral',
        description: voice.description,
      }));
    } catch (error: any) {
      this.logger.warn(`Failed to fetch ElevenLabs voices: ${error.message}`);
      return this.getDefaultVoices();
    }
  }

  private async generateWithElevenLabs(request: TTSRequestDto): Promise<Buffer> {
    const voiceId = request.voiceId || '21m00Tcm4TlvDq8ikWAM'; // Default voice

    const response = await axios.post(
      `${this.elevenLabsApiUrl}/text-to-speech/${voiceId}`,
      {
        text: request.text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: request.stability ?? 0.5,
          similarity_boost: request.similarityBoost ?? 0.75,
          style: 0,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          'xi-api-key': this.elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      },
    );

    return Buffer.from(response.data);
  }

  private async extractWordTimestamps(
    text: string,
    audioData: Buffer,
  ): Promise<WordTimestamp[]> {
    // ElevenLabs doesn't provide word-level timestamps in the basic API
    // This would require using a speech recognition service or
    // ElevenLabs' premium features
    // For now, return estimated timestamps based on text length

    const words = text.split(/\s+/);
    const estimatedDuration = this.calculateDuration(audioData);
    const timePerWord = estimatedDuration / words.length;

    return words.map((word, index) => ({
      word,
      start: index * timePerWord,
      end: (index + 1) * timePerWord,
      confidence: 0.9,
    }));
  }

  private calculateDuration(audioData: Buffer): number {
    // Rough estimation: MP3 at 128kbps is ~1KB per second
    // This is a placeholder - should use actual audio analysis
    return audioData.length / 1000;
  }

  private async uploadAudio(
    audioData: Buffer,
    userId: string,
    request: TTSRequestDto,
  ): Promise<string> {
    // TODO: Implement S3/R2 upload
    // For now, return a placeholder URL
    const filename = `tts_${userId}_${Date.now()}.mp3`;
    return `https://storage.example.com/audio/${filename}`;
  }

  private generateCacheKey(request: TTSRequestDto): string {
    const keyString = JSON.stringify({
      text: request.text,
      voiceId: request.voiceId,
      speed: request.speed,
      pitch: request.pitch,
      stability: request.stability,
      similarityBoost: request.similarityBoost,
    });

    return crypto.createHash('sha256').update(keyString).digest('hex');
  }

  private getDefaultVoices() {
    return [
      {
        id: '21m00Tcm4TlvDq8ikWAM',
        name: 'Rachel',
        provider: 'elevenlabs' as const,
        language: 'en',
        gender: 'female' as const,
        description: 'Default female voice',
      },
      {
        id: 'AZnzlk1XvdvUeBnXmlld',
        name: 'Domi',
        provider: 'elevenlabs' as const,
        language: 'en',
        gender: 'female' as const,
        description: 'Default female voice 2',
      },
      {
        id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Bella',
        provider: 'elevenlabs' as const,
        language: 'en',
        gender: 'female' as const,
        description: 'Default female voice 3',
      },
    ];
  }
}
