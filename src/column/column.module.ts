import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Columns } from 'src/entities/column.entity';
import { RelationShip } from 'src/entities/relationship.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Columns, RelationShip])],
  providers: [ColumnService],
  controllers: [ColumnController],
})
export class ColumnModule {}
