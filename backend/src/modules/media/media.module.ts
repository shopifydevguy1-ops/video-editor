import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { StorageService } from './storage.service';
import { PexelsService } from './pexels.service';
import { MediaController } from './media.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MediaController],
  providers: [MediaService, StorageService, PexelsService],
  exports: [MediaService, StorageService, PexelsService],
})
export class MediaModule {}

