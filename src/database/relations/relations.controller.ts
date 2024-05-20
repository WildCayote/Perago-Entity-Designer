import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RelationsService } from './relations.service';
import { CreateRelationDto } from './dto/create-relation.dto';
import { UpdateRelationDto } from './dto/update-relation.dto';

@Controller('database/relations')
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @Post()
  async create(@Body() createRelationDto: CreateRelationDto) {
    return await this.relationsService.create(createRelationDto);
  }

  @Get()
  async findAll() {
    return await this.relationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.relationsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRelationDto: UpdateRelationDto,
  ) {
    return await this.relationsService.update(id, updateRelationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.relationsService.remove(id);
  }
}
