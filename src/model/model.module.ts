import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';
import { RelationShip } from 'src/entities/relationship.entity';
import { CodeGenModule } from 'src/code-gen/code-gen.module';
import { Project } from 'src/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Model, Columns, RelationShip]),
    CodeGenModule,
  ],
  controllers: [ModelController],
  providers: [ModelService],
})
export class ModelModule {}
