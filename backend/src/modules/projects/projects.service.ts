import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Project, ProjectListItem } from '@ai-video-editor/shared';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProjectDto: CreateProjectDto): Promise<Project> {
    const defaultEditorState = {
      version: '1.0.0',
      aspectRatio: createProjectDto.aspectRatio,
      resolution: createProjectDto.resolution || this.getDefaultResolution(createProjectDto.aspectRatio),
      duration: 0,
      fps: 30,
      layers: [],
      transitions: [],
    };

    const project = await this.prisma.project.create({
      data: {
        userId,
        name: createProjectDto.name,
        description: createProjectDto.description,
        editorState: defaultEditorState,
      },
    });

    return this.mapToProject(project);
  }

  async findAll(userId: string): Promise<ProjectListItem[]> {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnailUrl: true,
        editorState: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      thumbnailUrl: p.thumbnailUrl || undefined,
      duration: (p.editorState as any).duration || 0,
      aspectRatio: (p.editorState as any).aspectRatio,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async findOne(userId: string, id: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.mapToProject(project);
  }

  async update(userId: string, id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(userId, id);

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...(updateProjectDto.name && { name: updateProjectDto.name }),
        ...(updateProjectDto.description !== undefined && { description: updateProjectDto.description }),
        ...(updateProjectDto.editorState && {
          editorState: {
            ...(project.editorState as any),
            ...updateProjectDto.editorState,
          },
        }),
      },
    });

    return this.mapToProject(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);
    await this.prisma.project.delete({
      where: { id },
    });
  }

  private getDefaultResolution(aspectRatio: string): { width: number; height: number } {
    switch (aspectRatio) {
      case '16:9':
        return { width: 1920, height: 1080 };
      case '9:16':
        return { width: 1080, height: 1920 };
      case '1:1':
        return { width: 1080, height: 1080 };
      case '4:5':
        return { width: 1080, height: 1350 };
      default:
        return { width: 1920, height: 1080 };
    }
  }

  private mapToProject(project: any): Project {
    return {
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description || undefined,
      editorState: project.editorState as any,
      thumbnailUrl: project.thumbnailUrl || undefined,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}

