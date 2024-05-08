import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';
import { RelationShip } from 'src/entities/relationship.entity';
import { CodeGenModule } from 'src/code-gen/code-gen.module';
import { Project } from 'src/entities/project.entity';
import { PgBossModule } from 'src/pg-boss/pg-boss.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Model, Columns, RelationShip]),
    forwardRef(() => CodeGenModule),
    PgBossModule,
  ],
  controllers: [ModelController],
  providers: [ModelService],
  exports: [ModelService],
})
export class ModelModule {}
