import { Controller, Get, Param } from '@nestjs/common';
import { EntitiesService } from './entities.service';

@Controller('generate/entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Get(':modelId') // GET request with an ID parameter (/entities/:modelId)
  async getEntityCodeById(@Param('modelId') modelId: string) {
    return await this.entitiesService.generateByModelId(modelId);
  }

  @Get('project/:projectId') // GET request with a project ID parameter (/entities/project/:projectId)
  async getAllEntities(@Param('projectId') projectId: string) {
    return await this.entitiesService.generateAllEntities(projectId);
  }
}
