import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ModelService } from './model.service';
import {
  CreateColumnDto,
  CreateModelDto,
  CreateProjectDto,
  UpdateColumnDto,
  UpdateModelDto,
  UpdateProjectDto,
} from './dto';
import { Response } from 'express';

@Controller({ path: 'projects', version: '1' })
export class ModelController {
  constructor(private modelService: ModelService) {}

  // @Get()
  // getProjects() {
  //   return this.modelService.getProjects();
  // }

  @Get(':projectId/extract')
  async extractCode(@Param('projectId') projectId) {
    const codeResponse = await this.modelService.extractModel(projectId);

    return codeResponse;
  }

  @Get(':jobId/obtain')
  async getResult(@Param('jobId') jobId, @Res() res: Response) {
    const buffer = await this.modelService.obtainResult(jobId);

    res.setHeader('Content-Disposition', 'attachment; filename="src.zip"');
    res.setHeader('Content-Type', 'application/zip');

    res.send(buffer);
  }

  // @Post()
  // createProject(@Body() model: CreateProjectDto) {
  //   return this.modelService.createProject(model);
  // }

  // @Patch(':id')
  // updateProject(
  //   @Param('id') projectId: string,
  //   @Body() model: UpdateProjectDto,
  // ) {
  //   return this.modelService.updateProject(projectId, model);
  // }

  // @Delete(':id')
  // deleteProject(@Param('id') projectId: string) {
  //   return this.modelService.deleteProject(projectId);
  // }

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

  @Get(':projectId/models/:modelId/columns')
  getModelColumns(
    @Param('projectId') projectId: string,
    @Param('modelId') id: string,
  ) {
    return this.modelService.getColumns(projectId, id);
  }

  @Get(':projectId/models/:modelId/columns/:columnId')
  getColumn(
    @Param('projectId') projectId: string,
    @Param('id') modelId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.modelService.getColumn(projectId, modelId, columnId);
  }

  @Post(':projectId/models/:modelId/columns')
  createModelColumn(
    @Param('projectId') projectId: string,
    @Param('modelId') modelId: string,
    @Body()
    data: CreateColumnDto,
  ) {
    return this.modelService.createColumn(modelId, data);
  }

  @Patch(':projectId/models/:modelId/columns/:columnId')
  updateModelColumn(
    @Param('projectId') projectId: string,
    @Param('modelId') modelId: string,
    @Param('columnId') columnId: string,
    @Body() data: UpdateColumnDto,
  ) {
    return this.modelService.updateColumn(projectId, modelId, columnId, data);
  }

  @Delete(':projectId/models/:modelId/columns/:columnId')
  deleteModelColumn(
    @Param('projectId') projectId: string,
    @Param('modelId') modelId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.modelService.deleteColumn(projectId, modelId, columnId);
  }
}
