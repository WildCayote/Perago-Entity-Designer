import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnItem } from './entities/column.entity';
import { ModelItem } from '../model/entities/model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnItem, ModelItem])],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}
