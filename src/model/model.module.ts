import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';
import { RelationShip } from 'src/entities/relationship.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Model, Columns, RelationShip])],
  controllers: [ModelController],
  providers: [ModelService],
})
export class ModelModule {}
