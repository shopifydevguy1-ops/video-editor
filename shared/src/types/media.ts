/**
 * Media library types
 */

export type MediaType = 'video' | 'image' | 'audio';

export interface MediaMetadata {
  duration?: number; // seconds (for video/audio)
  width?: number; // pixels (for video/image)
  height?: number; // pixels (for video/image)
  fps?: number; // for video
  bitrate?: number; // for video/audio
  codec?: string;
  format?: string;
  size?: number; // bytes
}

export interface MediaItem {
  id: string;
  userId: string;
  type: MediaType;
  name: string;
  url: string;
  thumbnailUrl?: string;
  metadata: MediaMetadata;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadMediaDto {
  type: MediaType;
  name: string;
  file: File | Buffer;
  tags?: string[];
}

