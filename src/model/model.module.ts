import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';

@Module({
  imports: [TypeOrmModule.forFeature([Model, Column])],
  controllers: [ModelController],
  providers: [ModelService],
})
export class ModelModule {}
