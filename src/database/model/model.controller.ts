import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ModelService } from './model.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@Controller('database/model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Post()
  async create(@Body() createModelDto: CreateModelDto) {
    return await this.modelService.create(createModelDto);
  }

  @Get()
  async findAll() {
    return await this.modelService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.modelService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateModelDto: UpdateModelDto,
  ) {
    return await this.modelService.update(id, updateModelDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.modelService.remove(id);
  }
}
