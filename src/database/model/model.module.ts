import { Module } from '@nestjs/common';
import { ModelService } from './model.service';
import { ModelController } from './model.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelItem } from './entities/model.entity';
import { ProjectItem } from '../project/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModelItem, ProjectItem])],
  controllers: [ModelController],
  providers: [ModelService],
  exports: [ModelService],
})
export class ModelModule {}
