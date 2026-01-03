import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RenderQueueService } from './render-queue.service';
import { StartRenderDto } from './dto/start-render.dto';
import { RenderJob, RenderStatus, RenderSettings, EditorState } from '@ai-video-editor/shared';
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

    const editorState = project.editorState as EditorState;
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

  private async processRender(renderId: string): Promise<void> {
    const render = await this.prisma.render.findUnique({
      where: { id: renderId },
      include: { project: true },
    });

    if (!render) {
      throw new Error('Render not found');
    }

    try {
      // Update status to processing
      await this.prisma.render.update({
        where: { id: renderId },
        data: {
          status: 'processing',
          startedAt: new Date(),
          progress: 0,
        },
      });

      const editorState = render.project.editorState as EditorState;
      const settings = render.settings as RenderSettings;

      // Generate video
      const outputPath = await this.renderVideo(renderId, editorState, settings);

      // Upload to storage
      const outputUrl = await this.uploadVideo(outputPath, renderId);

      // Update render as completed
      await this.prisma.render.update({
        where: { id: renderId },
        data: {
          status: 'completed',
          progress: 100,
          outputUrl,
          completedAt: new Date(),
        },
      });

      // Cleanup temp files
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

      // Add video layers
      const videoLayers = editorState.layers.filter((l) => l.type === 'video' || l.type === 'image');
      if (videoLayers.length === 0) {
        // Create a blank video if no video layers
        command
          .input('color=c=black:s=' + `${settings.resolution.width}x${settings.resolution.height}`)
          .inputFormat('lavfi')
          .inputOptions(['-t', editorState.duration.toString()]);
      } else {
        // Add actual video/image inputs
        videoLayers.forEach((layer) => {
          if (layer.type === 'video' && layer.src) {
            command.input(layer.src);
          } else if (layer.type === 'image' && layer.src) {
            command.input(layer.src);
          }
        });
      }

      // Add audio layers
      const audioLayers = editorState.layers.filter((l) => l.type === 'audio');
      audioLayers.forEach((layer) => {
        if (layer.src) {
          command.input(layer.src);
        }
      });

      // Build filter complex for composition
      const filterComplex = this.buildFilterComplex(editorState, settings);

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
        .outputOptions(['-c:a aac', '-b:a 192k'])
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

  private buildFilterComplex(editorState: EditorState, settings: RenderSettings): string[] {
    // This is a simplified version - full implementation would handle:
    // - Multiple video layers with positioning/scaling
    // - Text overlays
    // - Transitions
    // - Audio mixing

    const filters: string[] = [];

    // For now, just scale first video to output resolution
    filters.push(
      `[0:v]scale=${settings.resolution.width}:${settings.resolution.height}[v0]`,
    );

    // Add text overlays if needed
    const textLayers = editorState.layers.filter((l) => l.type === 'text');
    textLayers.forEach((layer, index) => {
      if (layer.type === 'text') {
        const x = layer.position?.x || 100;
        const y = layer.position?.y || 100;
        filters.push(
          `[v${index}]drawtext=text='${layer.content}':fontsize=${layer.fontSize}:fontcolor=${layer.color}:x=${x}:y=${y}[v${index + 1}]`,
        );
      }
    });

    return filters;
  }

  private async updateRenderProgress(renderId: string, progress: number): Promise<void> {
    try {
      await this.prisma.render.update({
        where: { id: renderId },
        data: { progress: Math.round(progress) },
      });
    } catch (error) {
      this.logger.warn(`Failed to update progress for render ${renderId}`);
    }
  }

  private async uploadVideo(filePath: string, renderId: string): Promise<string> {
    // TODO: Implement S3/R2 upload
    // For now, return placeholder
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
      settings: render.settings as RenderSettings,
      createdAt: render.createdAt,
      startedAt: render.startedAt || undefined,
      completedAt: render.completedAt || undefined,
    };
  }
}
