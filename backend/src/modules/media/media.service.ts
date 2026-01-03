import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from './storage.service';
import { MediaItem, MediaType, MediaMetadata } from '@ai-video-editor/shared';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async upload(
    userId: string,
    file: Express.Multer.File,
    tags?: string[],
  ): Promise<MediaItem> {
    try {
      // Determine media type
      const mediaType = this.getMediaType(file.mimetype);

      // Upload to storage
      const { url, key } = await this.storageService.uploadFile(
        file,
        'media',
        userId,
      );

      // Extract metadata
      const metadata = await this.extractMetadata(file, mediaType);

      // Generate thumbnail for videos/images
      let thumbnailUrl: string | undefined;
      if (mediaType === 'video' || mediaType === 'image') {
        thumbnailUrl = await this.generateThumbnail(
          file,
          mediaType,
          userId,
        );
      }

      // Save to database
      const mediaItem = await this.prisma.mediaItem.create({
        data: {
          userId,
          type: mediaType,
          name: file.originalname,
          url,
          thumbnailUrl,
          metadata: metadata as any,
          tags: tags || [],
        },
      });

      return this.mapToMediaItem(mediaItem);
    } catch (error: any) {
      this.logger.error(`Media upload failed: ${error.message}`, error.stack);
      throw new Error(`Failed to upload media: ${error.message}`);
    }
  }

  async findAll(userId: string, type?: MediaType): Promise<MediaItem[]> {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const items = await this.prisma.mediaItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return items.map(this.mapToMediaItem);
  }

  async findOne(userId: string, id: string): Promise<MediaItem> {
    const item = await this.prisma.mediaItem.findFirst({
      where: { id, userId },
    });

    if (!item) {
      throw new Error('Media item not found');
    }

    return this.mapToMediaItem(item);
  }

  async delete(userId: string, id: string): Promise<void> {
    const item = await this.prisma.mediaItem.findFirst({
      where: { id, userId },
    });

    if (!item) {
      throw new Error('Media item not found');
    }

    // Extract key from URL and delete from storage
    try {
      const key = this.extractKeyFromUrl(item.url);
      if (key) {
        await this.storageService.deleteFile(key);
      }
    } catch (error) {
      this.logger.warn(`Failed to delete file from storage: ${error}`);
    }

    await this.prisma.mediaItem.delete({
      where: { id },
    });
  }

  private getMediaType(mimetype: string): MediaType {
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('audio/')) return 'audio';
    throw new Error(`Unsupported media type: ${mimetype}`);
  }

  private async extractMetadata(
    file: Express.Multer.File,
    type: MediaType,
  ): Promise<MediaMetadata> {
    const metadata: MediaMetadata = {
      size: file.size,
      format: path.extname(file.originalname),
    };

    if (type === 'video') {
      return this.extractVideoMetadata(file);
    } else if (type === 'image') {
      return this.extractImageMetadata(file);
    } else if (type === 'audio') {
      return this.extractAudioMetadata(file);
    }

    return metadata;
  }

  private async extractVideoMetadata(
    file: Express.Multer.File,
  ): Promise<MediaMetadata> {
    return new Promise((resolve, reject) => {
      // Write buffer to temp file for ffprobe
      const tempPath = `/tmp/${Date.now()}_${file.originalname}`;
      fs.writeFile(tempPath, file.buffer)
        .then(() => {
          ffmpeg.ffprobe(tempPath, (err, metadata) => {
            fs.unlink(tempPath).catch(() => {}); // Cleanup

            if (err) {
              resolve({ size: file.size }); // Return minimal metadata on error
              return;
            }

            const videoStream = metadata.streams.find(
              (s) => s.codec_type === 'video',
            );
            const audioStream = metadata.streams.find(
              (s) => s.codec_type === 'audio',
            );

            resolve({
              duration: metadata.format.duration,
              width: videoStream?.width,
              height: videoStream?.height,
              fps: videoStream?.r_frame_rate
                ? eval(videoStream.r_frame_rate)
                : undefined,
              bitrate: metadata.format?.bit_rate
                ? parseInt(String(metadata.format.bit_rate))
                : undefined,
              codec: videoStream?.codec_name || undefined,
              format: metadata.format?.format_name || undefined,
              size: file.size,
            });
          });
        })
        .catch(reject);
    });
  }

  private async extractImageMetadata(
    file: Express.Multer.File,
  ): Promise<MediaMetadata> {
    // For images, we'd use sharp or similar
    // For now, return basic metadata
    return {
      size: file.size,
      format: path.extname(file.originalname),
    };
  }

  private async extractAudioMetadata(
    file: Express.Multer.File,
  ): Promise<MediaMetadata> {
    return new Promise((resolve, reject) => {
      const tempPath = `/tmp/${Date.now()}_${file.originalname}`;
      fs.writeFile(tempPath, file.buffer)
        .then(() => {
          ffmpeg.ffprobe(tempPath, (err, metadata) => {
            fs.unlink(tempPath).catch(() => {});

            if (err) {
              resolve({ size: file.size });
              return;
            }

            const audioStream = metadata.streams.find(
              (s) => s.codec_type === 'audio',
            );

            resolve({
              duration: metadata.format?.duration ? parseFloat(String(metadata.format.duration)) : undefined,
              bitrate: metadata.format?.bit_rate
                ? parseInt(String(metadata.format.bit_rate))
                : undefined,
              codec: audioStream?.codec_name || undefined,
              format: metadata.format?.format_name || undefined,
              size: file.size,
            });
          });
        })
        .catch(reject);
    });
  }

  private async generateThumbnail(
    file: Express.Multer.File,
    type: MediaType,
    userId: string,
  ): Promise<string> {
    if (type === 'image') {
      // For images, we can use the image itself as thumbnail
      // Or generate a smaller version
      return file.buffer
        ? await this.uploadImageThumbnail(file.buffer, userId)
        : '';
    } else if (type === 'video') {
      return await this.generateVideoThumbnail(file, userId);
    }
    return '';
  }

  private async generateVideoThumbnail(
    file: Express.Multer.File,
    userId: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const tempPath = `/tmp/${Date.now()}_${file.originalname}`;
      const thumbnailPath = `/tmp/${Date.now()}_thumb.jpg`;

      fs.writeFile(tempPath, file.buffer)
        .then(() => {
          ffmpeg(tempPath)
            .screenshots({
              timestamps: ['00:00:01'],
              filename: path.basename(thumbnailPath),
              folder: path.dirname(thumbnailPath),
              size: '320x180',
            })
            .on('end', async () => {
              try {
                const thumbnailBuffer = await fs.readFile(thumbnailPath);
                const { url } = await this.storageService.uploadBuffer(
                  thumbnailBuffer,
                  `${Date.now()}_thumb.jpg`,
                  'image/jpeg',
                  'thumbnails',
                  userId,
                );
                await fs.unlink(tempPath).catch(() => {});
                await fs.unlink(thumbnailPath).catch(() => {});
                resolve(url);
              } catch (error) {
                reject(error);
              }
            })
            .on('error', (err) => {
              fs.unlink(tempPath).catch(() => {});
              fs.unlink(thumbnailPath).catch(() => {});
              reject(err);
            });
        })
        .catch(reject);
    });
  }

  private async uploadImageThumbnail(
    buffer: Buffer,
    userId: string,
  ): Promise<string> {
    const { url } = await this.storageService.uploadBuffer(
      buffer,
      `${Date.now()}_thumb.jpg`,
      'image/jpeg',
      'thumbnails',
      userId,
    );
    return url;
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      // Extract key from URL
      // Format: https://bucket.r2.dev/folder/userId/filename
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove leading slash
    } catch {
      return null;
    }
  }

  private mapToMediaItem(item: any): MediaItem {
    return {
      id: item.id,
      userId: item.userId,
      type: item.type as MediaType,
      name: item.name,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl || undefined,
      metadata: item.metadata as MediaMetadata,
      tags: item.tags || [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
