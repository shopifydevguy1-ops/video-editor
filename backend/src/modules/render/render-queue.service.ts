import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { RenderService } from './render.service';
import { RenderProgressGateway } from '../websocket/websocket.gateway';
import { RenderJob } from '@ai-video-editor/shared';
import Redis from 'ioredis';

@Injectable()
export class RenderQueueService {
  private readonly logger = new Logger(RenderQueueService.name);
  private renderQueue: Queue;
  private renderWorker: Worker;
  private redis: Redis;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    @Inject(forwardRef(() => RenderService))
    private renderService: RenderService,
    private websocketGateway: RenderProgressGateway,
  ) {
    this.initializeRedis();
    this.initializeQueue();
    this.initializeWorker();
  }

  private initializeRedis() {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: parseInt(this.configService.get<string>('REDIS_PORT') || '6379'),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      maxRetriesPerRequest: null,
    });
  }

  private initializeQueue() {
    this.renderQueue = new Queue('render', {
      connection: this.redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    });
  }

  private initializeWorker() {
    this.renderWorker = new Worker(
      'render',
      async (job: Job) => {
        this.logger.log(`Processing render job ${job.id}`);
        
        const { renderId } = job.data;
        
        // Update job progress
        job.updateProgress(0);
        
        // Process render (this will be handled by RenderService)
        // For now, we'll call a method that processes the render
        await this.processRenderJob(renderId, job);
      },
      {
        connection: this.redis,
        concurrency: 2, // Process 2 renders concurrently
      },
    );

    this.renderWorker.on('completed', (job) => {
      this.logger.log(`Render job ${job.id} completed`);
    });

    this.renderWorker.on('failed', (job, err) => {
      if (job) {
        this.logger.error(`Render job ${job.id} failed: ${err.message}`);
      }
    });

    this.renderWorker.on('progress', (job, progress) => {
      if (job) {
        this.logger.log(`Render job ${job.id} progress: ${progress}%`);
      }
    });
  }

  async addRenderJob(renderId: string, priority: number = 0): Promise<void> {
    await this.renderQueue.add(
      'process-render',
      { renderId },
      {
        priority,
        jobId: renderId, // Use renderId as jobId to prevent duplicates
      },
    );
    this.logger.log(`Added render job ${renderId} to queue`);
  }

  async getJobStatus(renderId: string): Promise<{
    status: string;
    progress: number;
    error?: string;
  }> {
    const job = await this.renderQueue.getJob(renderId);
    
    if (!job) {
      // Check if render exists in database
      const render = await this.prisma.render.findUnique({
        where: { id: renderId },
      });
      
      if (!render) {
        throw new Error('Render job not found');
      }
      
      return {
        status: render.status,
        progress: render.progress,
        error: render.errorMessage || undefined,
      };
    }

    const state = await job.getState();
    const progressValue = job.progress;
    const progress = typeof progressValue === 'number' ? progressValue : (typeof progressValue === 'object' && progressValue !== null ? (progressValue as any).value || 0 : 0);

    return {
      status: state,
      progress: typeof progress === 'number' ? progress : 0,
      error: job.failedReason || undefined,
    };
  }

  private async processRenderJob(renderId: string, job: Job): Promise<void> {
    // This method will be called by the worker
    // The actual rendering logic is in RenderService
    // We'll update progress through the job object
    
    try {
      const render = await this.prisma.render.findUnique({
        where: { id: renderId },
        include: { project: true },
      });

      if (!render) {
        throw new Error('Render not found');
      }

      // Update status to processing
      await this.prisma.render.update({
        where: { id: renderId },
        data: {
          status: 'processing',
          startedAt: new Date(),
          progress: 0,
        },
      });

      job.updateProgress(10);

      // Call render service to process (handles everything)
      await this.renderService.processRender(renderId);
    } catch (error: any) {
      this.logger.error(`Render job ${renderId} failed: ${error.message}`);
      await this.prisma.render.update({
        where: { id: renderId },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });
      // Emit error via WebSocket
      this.websocketGateway.emitError(renderId, error.message);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.renderWorker.close();
    await this.renderQueue.close();
    await this.redis.quit();
  }
}

