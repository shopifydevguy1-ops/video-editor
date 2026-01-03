import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  image: string;
  video_files: Array<{
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }>;
  video_pictures: Array<{
    id: number;
    picture: string;
  }>;
}

export interface PexelsSearchResponse {
  page: number;
  per_page: number;
  total_results: number;
  videos: PexelsVideo[];
}

@Injectable()
export class PexelsService {
  private readonly logger = new Logger(PexelsService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.pexels.com/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PEXELS_API_KEY') || '';
  }

  async searchVideos(
    query: string,
    options: {
      perPage?: number;
      page?: number;
      orientation?: 'landscape' | 'portrait' | 'square';
      size?: 'large' | 'medium' | 'small';
      minDuration?: number;
      maxDuration?: number;
    } = {},
  ): Promise<PexelsSearchResponse> {
    if (!this.apiKey) {
      this.logger.warn('Pexels API key not configured');
      return {
        page: 1,
        per_page: 0,
        total_results: 0,
        videos: [],
      };
    }

    try {
      const params = new URLSearchParams({
        query,
        per_page: (options.perPage || 15).toString(),
        page: (options.page || 1).toString(),
      });

      if (options.orientation) {
        params.append('orientation', options.orientation);
      }
      if (options.size) {
        params.append('size', options.size);
      }
      if (options.minDuration) {
        params.append('min_duration', options.minDuration.toString());
      }
      if (options.maxDuration) {
        params.append('max_duration', options.maxDuration.toString());
      }

      const response = await axios.get<PexelsSearchResponse>(
        `${this.apiUrl}/videos/search?${params.toString()}`,
        {
          headers: {
            Authorization: this.apiKey,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Pexels API error: ${error.message}`);
      throw new Error(`Failed to search Pexels videos: ${error.message}`);
    }
  }

  async getVideoById(id: number): Promise<PexelsVideo | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await axios.get<PexelsVideo>(
        `${this.apiUrl}/videos/videos/${id}`,
        {
          headers: {
            Authorization: this.apiKey,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get Pexels video ${id}: ${error.message}`);
      return null;
    }
  }

  async getPopularVideos(
    perPage: number = 15,
    page: number = 1,
  ): Promise<PexelsSearchResponse> {
    if (!this.apiKey) {
      return {
        page: 1,
        per_page: 0,
        total_results: 0,
        videos: [],
      };
    }

    try {
      const response = await axios.get<PexelsSearchResponse>(
        `${this.apiUrl}/videos/popular?per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: this.apiKey,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get popular videos: ${error.message}`);
      return {
        page: 1,
        per_page: 0,
        total_results: 0,
        videos: [],
      };
    }
  }

  // Helper to select best video file for a given resolution
  selectBestVideoFile(
    video: PexelsVideo,
    targetWidth: number,
    targetHeight: number,
  ): string | null {
    if (!video.video_files || video.video_files.length === 0) {
      return null;
    }

    // Find closest match to target resolution
    const sorted = video.video_files
      .filter((file) => file.file_type === 'video/mp4')
      .sort((a, b) => {
        const aDiff = Math.abs(a.width - targetWidth) + Math.abs(a.height - targetHeight);
        const bDiff = Math.abs(b.width - targetWidth) + Math.abs(b.height - targetHeight);
        return aDiff - bDiff;
      });

    return sorted[0]?.link || null;
  }
}

