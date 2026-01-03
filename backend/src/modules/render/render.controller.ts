import { Controller, Post, Get, UseGuards, Request, Body, Param } from '@nestjs/common';
import { RenderService } from './render.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StartRenderDto } from './dto/start-render.dto';

@Controller('render')
@UseGuards(JwtAuthGuard)
export class RenderController {
  constructor(private readonly renderService: RenderService) {}

  @Post('start')
  startRender(@Request() req, @Body() startRenderDto: StartRenderDto) {
    return this.renderService.startRender(req.user.id, startRenderDto);
  }

  @Get(':id/status')
  getRenderStatus(@Param('id') id: string) {
    return this.renderService.getRenderStatus(id);
  }
}

