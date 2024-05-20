import { Module } from '@nestjs/common';
import { RelationsService } from './relations.service';
import { RelationsController } from './relations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnItem } from '../columns/entities/column.entity';
import { RelationItem } from './entities/relation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RelationItem, ColumnItem])],
  controllers: [RelationsController],
  providers: [RelationsService],
})
export class RelationsModule {}
