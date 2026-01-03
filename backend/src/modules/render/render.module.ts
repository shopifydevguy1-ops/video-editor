import { Module } from '@nestjs/common';
import { RenderService } from './render.service';
import { RenderQueueService } from './render-queue.service';
import { RenderController } from './render.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RenderController],
  providers: [RenderService, RenderQueueService],
  exports: [RenderService, RenderQueueService],
})
export class RenderModule {}

