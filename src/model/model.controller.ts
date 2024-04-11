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
}
