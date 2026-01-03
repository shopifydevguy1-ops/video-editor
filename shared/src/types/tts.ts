/**
 * Text-to-Speech types
 */

export interface TTSVoice {
  id: string;
  name: string;
  provider: 'elevenlabs' | 'google' | 'azure' | 'openai';
  language: string;
  accent?: string;
  gender?: 'male' | 'female' | 'neutral';
  age?: 'child' | 'young' | 'adult' | 'elderly';
  description?: string;
}

export interface TTSRequest {
  text: string;
  voiceId: string;
  speed?: number; // 0.5 - 2.0, default 1.0
  pitch?: number; // -20 to +20 semitones
  stability?: number; // 0-1 (ElevenLabs)
  similarityBoost?: number; // 0-1 (ElevenLabs)
  format?: 'mp3' | 'wav' | 'ogg';
}

export interface TTSResponse {
  audioUrl: string;
  duration: number; // seconds
  wordTimestamps: WordTimestamp[];
  voiceId: string;
  text: string;
}

export interface WordTimestamp {
  word: string;
  start: number; // seconds
  end: number; // seconds
  confidence?: number; // 0-1
}

export interface TTSCacheEntry {
  textHash: string; // SHA-256 of text + voice + settings
  voiceId: string;
  audioUrl: string;
  duration: number;
  wordTimestamps: WordTimestamp[];
  createdAt: Date;
}

