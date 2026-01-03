import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Request() req: ExpressRequest & { user: { id: string } }, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(req.user.id, createProjectDto);
  }

  @Get()
  findAll(@Request() req: ExpressRequest & { user: { id: string } }) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: ExpressRequest & { user: { id: string } }, @Param('id') id: string) {
    return this.projectsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Request() req: ExpressRequest & { user: { id: string } },
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(req.user.id, id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Request() req: ExpressRequest & { user: { id: string } }, @Param('id') id: string) {
    return this.projectsService.remove(req.user.id, id);
  }
}

