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

@Controller({ version: '1' })
export class ColumnController {
  constructor(private columnService: ColumnService) {}

  @Get('models/:modelId/columns/:columnId')
  getColumn(
    @Param('modelId') modelId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.columnService.getColumn(modelId, columnId);
  }

  @Post('models/:modelId/columns')
  createModelColumn(
    @Param('modelId') modelId: string,
    @Body()
    data: CreateColumnDto,
  ) {
    return this.columnService.createColumn(modelId, data);
  }

  @Patch('models/:modelId/columns/:columnId')
  updateModelColumn(
    @Param('modelId') modelId: string,
    @Param('columnId') columnId: string,
    @Body() data: UpdateColumnDto,
  ) {
    return this.columnService.updateColumn(modelId, columnId, data);
  }

  @Delete(':projectId/models/:modelId/columns/:columnId')
  deleteModelColumn(
    @Param('modelId') modelId: string,
    @Param('columnId') columnId: string,
  ) {
    return this.columnService.deleteColumn(modelId, columnId);
  }
}
