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
import {
  CreateColumnDto,
  CreateModelDto,
  UpdateColumnDto,
  UpdateModelDto,
} from './dto';

@Controller({ path: 'models', version: '1' })
export class ModelController {
  constructor(private modelService: ModelService) {}

  @Get()
  getModels() {
    return this.modelService.getModels();
  }

  @Get(':id')
  getModel(@Param('id') id: string) {
    return this.modelService.getModel(id);
  }

  @Post()
  createModel(@Body() model: CreateModelDto) {
    return this.modelService.createModel(model);
  }

  @Patch(':id')
  updateModel(@Param('id') id: string, @Body() model: UpdateModelDto) {
    return this.modelService.updateModel(id, model);
  }

  @Delete(':id')
  deleteModle(@Param('id') id: string) {
    return this.modelService.deleteModel(id);
  }

  @Get(':id/columns')
  getModelColumns(@Param('id') id: string) {
    return this.modelService.getColumns(id);
  }

  @Get(':id/columns/:columnId')
  getColumn(@Param('id') modelId: string, @Param('columnId') columnId: string) {
    return this.modelService.getColumn(modelId, columnId);
  }

  @Post(':id/columns')
  createModelColumn(@Param('id') id: string, @Body() data: CreateColumnDto) {
    return this.modelService.createColumn(id, data);
  }

  @Patch(':id/columns/:columnId')
  updateModelColumn(
    @Param('id') id: string,
    @Param('columnId') columnId: string,
    @Body() data: UpdateColumnDto,
  ) {
    return this.modelService.updateColumn(id, columnId, data);
  }

  @Delete(':id/columns/:columnId')
  deleteModelColumn(
    @Param('id') id: string,
    @Param('columnId') columnId: string,
  ) {
    return this.modelService.deleteColumn(id, columnId);
  }
}
