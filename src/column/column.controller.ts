import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto, UpdateColumnDto } from './dto/column.dto';

@Controller({ path: 'models', version: '1' })
export class ColumnController {
  constructor(private columnService: ColumnService) {}

  @Get(':modelId/columns')
  getColumns(@Param('modelId') modelId: string) {
    return this.columnService.getColumns(modelId);
  }

  @Get(':modelId/columns/:columnId')
  getColumn(
    @Param('modelId') modelId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.columnService.getColumn(modelId, columnId);
  }

  @Post(':modelId/columns')
  createModelColumn(
    @Param('modelId') modelId: string,
    @Body()
    data: CreateColumnDto,
  ) {
    return this.columnService.createColumn(modelId, data);
  }

  @Patch(':modelId/columns/:columnId')
  updateModelColumn(
    @Param('modelId') modelId: string,
    @Param('columnId') columnId: string,
    @Body() data: UpdateColumnDto,
  ) {
    return this.columnService.updateColumn(modelId, columnId, data);
  }

  @Delete(':modelId/columns/:columnId')
  deleteModelColumn(
    @Param('modelId') modelId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.columnService.deleteColumn(modelId, columnId);
  }
}
