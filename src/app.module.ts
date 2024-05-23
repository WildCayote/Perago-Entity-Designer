import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelModule } from './model/model.module';
import { Model } from './entities/model.entity';
import { Columns } from './entities/column.entity';
import { RelationShip } from './entities/relationship.entity';
import { CodeGenModule } from './code-gen/code-gen.module';
import { Project } from './entities/project.entity';
import { PgBossModule } from './pg-boss/pg-boss.module';
import { ProjectModule } from './project/project.module';
import { ColumnModule } from './column/column.module';
import { ExtractorModule } from './extractor/extractor.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'lens',
      database: 'PeragoEntityDB',
      entities: [Project, Model, Columns, RelationShip],
      synchronize: true,
    }),
    ModelModule,
    CodeGenModule,
    PgBossModule,
    ProjectModule,
    ColumnModule,
    ExtractorModule,
  ],
})
export class AppModule {}
