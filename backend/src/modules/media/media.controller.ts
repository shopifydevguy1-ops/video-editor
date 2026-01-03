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
import { Request as ExpressRequest } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { PexelsService } from './pexels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaType } from '@ai-video-editor/shared';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly pexelsService: PexelsService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Request() req: ExpressRequest & { user: { id: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body('tags') tags?: string,
  ) {
    const tagArray = tags ? (Array.isArray(tags) ? tags : [tags]) : undefined;
    return this.mediaService.upload(req.user.id, file, tagArray);
  }

  @Get()
  findAll(@Request() req: ExpressRequest & { user: { id: string } }, @Query('type') type?: MediaType) {
    return this.mediaService.findAll(req.user.id, type);
  }

  @Get(':id')
  findOne(@Request() req: ExpressRequest & { user: { id: string } }, @Param('id') id: string) {
    return this.mediaService.findOne(req.user.id, id);
  }

  @Delete(':id')
  delete(@Request() req: ExpressRequest & { user: { id: string } }, @Param('id') id: string) {
    return this.mediaService.delete(req.user.id, id);
  }

  @Get('stock/search')
  searchStockVideos(
    @Query('query') query: string,
    @Query('orientation') orientation?: 'landscape' | 'portrait' | 'square',
    @Query('perPage') perPage?: string,
  ) {
    return this.pexelsService.searchVideos(query, {
      perPage: perPage ? parseInt(perPage) : 15,
      orientation,
    });
  }

  @Get('stock/popular')
  getPopularVideos(
    @Query('perPage') perPage?: string,
    @Query('page') page?: string,
  ) {
    return this.pexelsService.getPopularVideos(
      perPage ? parseInt(perPage) : 15,
      page ? parseInt(page) : 1,
    );
  }
}
