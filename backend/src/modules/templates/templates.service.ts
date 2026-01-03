import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Template } from '@ai-video-editor/shared';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Template[]> {
    const templates = await this.prisma.template.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
    });

    return templates.map(this.mapToTemplate);
  }

  async findOne(id: string): Promise<Template> {
    const template = await this.prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    return this.mapToTemplate(template);
  }

  private mapToTemplate(template: any): Template {
    return {
      id: template.id,
      name: template.name,
      category: template.category as any,
      description: template.description || undefined,
      previewUrl: template.previewUrl || undefined,
      config: template.config as any,
      isPublic: template.isPublic,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}

