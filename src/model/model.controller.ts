import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ModelService } from './model.service';
import { CreateModelDto, UpdateModelDto } from './dto';

@Controller({ path: 'projects', version: '1' })
export class ModelController {
  constructor(private modelService: ModelService) {}

  @Get(':id/models')
  getModels(@Param('id') projectId: string) {
    return this.modelService.getModels(projectId);
  }

  @Get(':projectId/models/:id')
  getModel(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.modelService.getModel(projectId, id);
  }

  @Post(':projectId/models/')
  createModel(@Param('projectId') projectId, @Body() model: CreateModelDto) {
    return this.modelService.createModel(projectId, model);
  }

  @Patch(':projectId/models/:modelId')
  updateModel(
    @Param('projectId') projectId: string,
    @Param('modelId') id: string,
    @Body() model: UpdateModelDto,
  ) {
    return this.modelService.updateModel(projectId, id, model);
  }

  @Delete(':projectId/models/:modelId')
  deleteModel(
    @Param('projectId') projectId: string,
    @Param('modelId') id: string,
  ) {
    return this.modelService.deleteModel(projectId, id);
  }
}
