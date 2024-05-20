import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelItem } from 'src/database/model/entities/model.entity';
import { ColumnItem } from 'src/database/columns/entities/column.entity';
import { RelationItem } from 'src/database/relations/entities/relation.entity';
import { HandlebarsService } from 'src/handlebars.service';
import { ModelService } from 'src/database/model/model.service';
import { ProjectItem } from 'src/database/project/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ModelItem,
      ColumnItem,
      RelationItem,
      ProjectItem,
    ]),
  ],
  controllers: [EntitiesController],
  providers: [EntitiesService, HandlebarsService, ModelService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
