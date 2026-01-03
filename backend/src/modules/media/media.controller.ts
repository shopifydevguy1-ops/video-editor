import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaType } from '@ai-video-editor/shared';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('tags') tags?: string,
  ) {
    const tagArray = tags ? (Array.isArray(tags) ? tags : [tags]) : undefined;
    return this.mediaService.upload(req.user.id, file, tagArray);
  }

  @Get()
  findAll(@Request() req, @Query('type') type?: MediaType) {
    return this.mediaService.findAll(req.user.id, type);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.mediaService.findOne(req.user.id, id);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.mediaService.delete(req.user.id, id);
  }
}

