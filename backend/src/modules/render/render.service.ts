import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RenderQueueService } from './render-queue.service';
import { RenderProgressGateway } from '../websocket/websocket.gateway';
import { StartRenderDto } from './dto/start-render.dto';
import { RenderJob, RenderStatus, RenderSettings, EditorState, Layer } from '@ai-video-editor/shared';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RenderService {
  private readonly logger = new Logger(RenderService.name);
  private readonly tempDir: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private renderQueue: RenderQueueService,
    private websocketGateway: RenderProgressGateway,
  ) {
    this.tempDir = path.join(process.cwd(), 'temp', 'renders');
    this.ensureTempDir();
  }

  async startRender(userId: string, dto: StartRenderDto): Promise<RenderJob> {
    // Get project
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.userId !== userId) {
      throw new Error('Access denied');
    }

    const editorState = project.editorState as unknown as EditorState;
    const defaultSettings: RenderSettings = {
      resolution: editorState.resolution,
      fps: editorState.fps,
      bitrate: '5M',
      codec: 'h264',
      preset: 'medium',
      quality: 23,
      includeCaptions: true,
    };

    const settings = { ...defaultSettings, ...dto.settings };

    // Create render job
    const render = await this.prisma.render.create({
      data: {
        projectId: dto.projectId,
        userId,
        status: 'pending',
        progress: 0,
        settings: settings as any,
      },
    });

    // Add to render queue
    await this.renderQueue.addRenderJob(render.id);

    return this.mapToRenderJob(render);
  }

  async getRenderStatus(renderId: string): Promise<RenderJob> {
    const render = await this.prisma.render.findUnique({
      where: { id: renderId },
    });

    if (!render) {
      throw new Error('Render not found');
    }

    return this.mapToRenderJob(render);
  }

  async processRender(renderId: string): Promise<void> {
    const render = await this.prisma.render.findUnique({
      where: { id: renderId },
      include: { project: true },
    });

    if (!render) {
      throw new Error('Render not found');
    }

    try {
      await this.prisma.render.update({
        where: { id: renderId },
        data: {
          status: 'processing',
          startedAt: new Date(),
          progress: 0,
        },
      });

      const editorState = render.project.editorState as unknown as EditorState;
      const settings = render.settings as unknown as RenderSettings;

      const outputPath = await this.renderVideo(renderId, editorState, settings);
      const outputUrl = await this.uploadVideo(outputPath, renderId);

      await this.prisma.render.update({
        where: { id: renderId },
        data: {
          status: 'completed',
          progress: 100,
          outputUrl,
          completedAt: new Date(),
        },
      });

      this.websocketGateway.emitComplete(renderId, outputUrl);
      await this.cleanupTempFiles(outputPath);
    } catch (error: any) {
      this.logger.error(`Render ${renderId} failed: ${error.message}`, error.stack);
      await this.prisma.render.update({
        where: { id: renderId },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });
      this.websocketGateway.emitError(renderId, error.message);
    }
  }

  private async renderVideo(
    renderId: string,
    editorState: EditorState,
    settings: RenderSettings,
  ): Promise<string> {
    const outputPath = path.join(this.tempDir, `${renderId}.mp4`);

    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      // Collect all video/image layers
      const videoLayers = editorState.layers.filter(
        (l) => l.type === 'video' || l.type === 'image',
      );
      const audioLayers = editorState.layers.filter((l) => l.type === 'audio');
      const textLayers = editorState.layers.filter((l) => l.type === 'text');

      // Add video/image inputs
      if (videoLayers.length === 0) {
        // Create blank video
        command
          .input('color=c=black:s=' + `${settings.resolution.width}x${settings.resolution.height}`)
          .inputFormat('lavfi')
          .inputOptions(['-t', editorState.duration.toString()]);
      } else {
        videoLayers.forEach((layer) => {
          if (layer.src) {
            command.input(layer.src);
          }
        });
      }

      // Add audio inputs
      audioLayers.forEach((layer) => {
        if (layer.src) {
          command.input(layer.src);
        }
      });

      // Build comprehensive filter complex
      const filterComplex = this.buildAdvancedFilterComplex(
        editorState,
        settings,
        videoLayers,
        textLayers,
        audioLayers,
      );

      command
        .complexFilter(filterComplex)
        .outputOptions([
          `-c:v libx264`,
          `-preset ${settings.preset}`,
          `-crf ${settings.quality}`,
          `-r ${settings.fps}`,
          `-pix_fmt yuv420p`,
          settings.bitrate ? `-b:v ${settings.bitrate}` : '',
        ])
        .outputOptions(['-c:a aac', '-b:a 192k', '-shortest'])
        .output(outputPath)
        .on('start', (commandLine) => {
          this.logger.log(`FFmpeg started: ${commandLine}`);
        })
        .on('progress', (progress) => {
          const percent = progress.percent || 0;
          this.updateRenderProgress(renderId, Math.min(100, Math.max(0, percent)));
        })
        .on('end', () => {
          this.logger.log(`Render ${renderId} completed`);
          resolve(outputPath);
        })
        .on('error', (error) => {
          this.logger.error(`FFmpeg error: ${error.message}`);
          reject(error);
        })
        .run();
    });
  }

  private buildAdvancedFilterComplex(
    editorState: EditorState,
    settings: RenderSettings,
    videoLayers: Layer[],
    textLayers: Layer[],
    audioLayers: Layer[],
  ): string[] {
    const filters: string[] = [];
    let videoIndex = 0;
    let audioIndex = videoLayers.length;

    // Process video layers with transitions
    videoLayers.forEach((layer, index) => {
      if (layer.type === 'video' || layer.type === 'image') {
        const scale = layer.scale || 1;
        const x = layer.position?.x || 0;
        const y = layer.position?.y || 0;
        const opacity = layer.opacity || 1;

        // Scale and position
        filters.push(
          `[${videoIndex}:v]scale=${settings.resolution.width * scale}:${settings.resolution.height * scale},setpts=PTS-STARTPTS[v${index}]`,
        );

        // Overlay with opacity
        if (index === 0) {
          filters.push(
            `color=c=black:s=${settings.resolution.width}x${settings.resolution.height}[bg]`,
          );
          filters.push(
            `[bg][v${index}]overlay=${x}:${y}:enable='between(t,${layer.startTime},${layer.startTime + layer.duration})':alpha=${opacity}[comp${index}]`,
          );
        } else {
          filters.push(
            `[comp${index - 1}][v${index}]overlay=${x}:${y}:enable='between(t,${layer.startTime},${layer.startTime + layer.duration})':alpha=${opacity}[comp${index}]`,
          );
        }

        videoIndex++;
      }
    });

    // Add text overlays
    let compIndex = videoLayers.length > 0 ? videoLayers.length - 1 : 0;
    textLayers.forEach((layer, index) => {
      if (layer.type === 'text' && settings.includeCaptions) {
        const x = (layer.position?.x || 0) * (settings.resolution.width / (editorState.resolution.width || 1920));
        const y = (layer.position?.y || 0) * (settings.resolution.height / (editorState?.resolution.height || 1080));
        const fontSize = layer.fontSize * (settings.resolution.width / (editorState.resolution.width || 1920));

        // Escape text for FFmpeg
        const textContent = layer.type === 'text' ? layer.content : '';
        const escapedText = textContent
          .replace(/\\/g, '\\\\')
          .replace(/:/g, '\\:')
          .replace(/'/g, "\\'");

        filters.push(
          `[comp${compIndex}]drawtext=text='${escapedText}':fontsize=${fontSize}:fontcolor=${layer.color}:x=${x}:y=${y}:enable='between(t,${layer.startTime},${layer.startTime + layer.duration})'[comp${compIndex + 1}]`,
        );
        compIndex++;
      }
    });

    // Final output
    filters.push(`[comp${compIndex}]scale=${settings.resolution.width}:${settings.resolution.height}[final]`);

    // Audio mixing
    if (audioLayers.length > 0) {
      audioLayers.forEach((layer, index) => {
        const volume = layer.type === 'audio' ? (layer.volume || 1) : 1;
        filters.push(
          `[${audioIndex + index}:a]volume=${volume},adelay=${layer.startTime * 1000}|${layer.startTime * 1000}[a${index}]`,
        );
      });

      // Mix all audio tracks
      if (audioLayers.length > 1) {
        const audioInputs = audioLayers.map((_, i) => `[a${i}]`).join('');
        filters.push(`${audioInputs}amix=inputs=${audioLayers.length}[audio]`);
      } else {
        filters.push(`[a0]acopy[audio]`);
      }
    }

    return filters;
  }

  private async updateRenderProgress(renderId: string, progress: number): Promise<void> {
    try {
      await this.prisma.render.update({
        where: { id: renderId },
        data: { progress: Math.round(progress) },
      });
      this.websocketGateway.emitProgress(renderId, progress);
    } catch (error) {
      this.logger.warn(`Failed to update progress for render ${renderId}`);
    }
  }

  private async uploadVideo(filePath: string, renderId: string): Promise<string> {
    // TODO: Implement S3/R2 upload
    return `https://storage.example.com/renders/${renderId}.mp4`;
  }

  private async cleanupTempFiles(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.warn(`Failed to cleanup temp file: ${filePath}`);
    }
  }

  private async ensureTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create temp directory: ${this.tempDir}`);
    }
  }

  private mapToRenderJob(render: any): RenderJob {
    return {
      id: render.id,
      projectId: render.projectId,
      userId: render.userId,
      status: render.status as RenderStatus,
      progress: render.progress,
      outputUrl: render.outputUrl || undefined,
      errorMessage: render.errorMessage || undefined,
      settings: render.settings as unknown as RenderSettings,
      createdAt: render.createdAt,
      startedAt: render.startedAt || undefined,
      completedAt: render.completedAt || undefined,
    };
  }
}
