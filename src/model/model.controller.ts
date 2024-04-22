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

@Controller({ path: 'models', version: '1' })
export class ModelController {
  constructor(private modelService: ModelService) {}

  @Get('projects')
  getProjects() {
    return this.modelService.getProjects();
  }

  @Post('projects')
  createProject(@Body() model: CreateProjectDto) {
    return this.modelService.createProject(model);
  }

  @Patch('projects/:id')
  updateProject(
    @Param('id') projectId: string,
    @Body() model: UpdateProjectDto,
  ) {
    return this.modelService.updateProject(projectId, model);
  }

  @Delete('projects/:id')
  deleteProject(@Param('id') projectId: string) {
    return this.modelService.deleteProject(projectId  );
  }

  @Get('projects/:id/models')
  getModels(@Param('id') projectId: string) {
    return this.modelService.getModels(projectId);
  }

  @Get('projects/:projectId/models/:id')
  getModel(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.modelService.getModel(projectId, id);
  }

  @Get('projects/:projectId/models/:id/extract')
  async extractModel(@Param('id') id: string, @Res() res: Response) {
    const codeResponse = await this.modelService.extractModel(id);

    res.set('Content-Type', 'text/typescript');
    res.attachment(`${codeResponse.fileName}.ts`);
    res.send(codeResponse.code);
  }

  @Post('projects/:projectId/models/')
  createModel(@Param('projectId') projectId, @Body() model: CreateModelDto) {
    return this.modelService.createModel(projectId, model);
  }

  @Patch('projects/:projectId/models/:modelId')
  updateModel(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() model: UpdateModelDto,
  ) {
    return this.modelService.updateModel(projectId, id, model);
  }

  @Delete('projects/:projectId/models/:modelId')
  deleteModel(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.modelService.deleteModel(projectId, id);
  }

  @Get('projects/:projectId/models/:modelId/columns')
  getModelColumns(
    @Param('projectId') projectId: string,
    @Param('modelId') id: string,
  ) {
    return this.modelService.getColumns(projectId, id);
  }

  @Get('projects/:projectId/models/:modelId/columns/:columnId')
  getColumn(
    @Param('projectId') projectId: string,
    @Param('id') modelId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.modelService.getColumn(projectId, modelId, columnId);
  }

  @Post('projects/:projectId/models/:modelId/columns')
  createModelColumn(@Param('id') id: string, @Body() data: CreateColumnDto) {
    return this.modelService.createColumn(id, data);
  }

  @Patch('projects/:projectId/models/:modelId/columns/:columnId')
  updateModelColumn(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Param('columnId') columnId: string,
    @Body() data: UpdateColumnDto,
  ) {
    return this.modelService.updateColumn(projectId, id, columnId, data);
  }

  @Delete('projects/:projectId/models/:modelId/columns/:columnId')
  deleteModelColumn(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Param('columnId') columnId: string,
  ) {
    return this.modelService.deleteColumn(projectId, id, columnId);
  }
}
