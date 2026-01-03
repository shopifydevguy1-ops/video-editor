import { Module } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { GeneratorController } from './generator.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TTSModule } from '../tts/tts.module';
import { ProjectsModule } from '../projects/projects.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [PrismaModule, TTSModule, ProjectsModule, MediaModule],
  controllers: [GeneratorController],
  providers: [GeneratorService],
  exports: [GeneratorService],
})
export class GeneratorModule {}

