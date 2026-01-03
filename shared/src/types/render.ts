/**
 * Video rendering types
 */

export type RenderStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed';

export interface RenderJob {
  id: string;
  projectId: string;
  userId: string;
  status: RenderStatus;
  progress: number; // 0-100
  outputUrl?: string;
  errorMessage?: string;
  settings: RenderSettings;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface RenderSettings {
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  bitrate?: string; // e.g., "5M"
  codec?: 'h264' | 'h265' | 'vp9';
  preset?: 'ultrafast' | 'fast' | 'medium' | 'slow';
  quality?: number; // CRF value (0-51, lower = better)
  includeCaptions: boolean;
  watermark?: {
    url: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    opacity: number;
  };
}

export interface StartRenderDto {
  projectId: string;
  settings?: Partial<RenderSettings>;
}

