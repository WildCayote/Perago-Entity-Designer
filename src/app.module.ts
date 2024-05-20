import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from '../config/typeorm.config';

import { ModelModule } from './database/model/model.module';
import { ColumnsModule } from './database/columns/columns.module';
import { RelationsModule } from './database/relations/relations.module';
import { ProjectModule } from './database/project/project.module';
import { EntitiesModule } from './code-gen/entities/entities.module';
import { DtosModule } from './code-gen/dtos/dtos.module';
import { ServicesModule } from './code-gen/services/services.module';
import { ControllersModule } from './code-gen/controllers/controllers.module';
import { ModulesModule } from './code-gen/modules/modules.module';
import { HandlebarsService } from './handlebars.service';
import { FileIoModule } from './file-io/file-io.module';
import { BootstrapModule } from './code-gen/bootstrap/bootstrap.module';
import { PgBossModule } from './pg-boss/pg-boss.module';
import { CodeGenModule } from './code-gen/code-gen.module';

@Module({
  imports: [
    // TypeOrmModule.forRoot(typeormConfig),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'dawit',
      database: 'database',
      // entities: [Project, Model, Columns, RelationShip],
      entities: [__dirname + '/../**/*.entity.{ts,js}'],
      synchronize: true,
    }),
    ProjectModule,
    ModelModule,
    ColumnsModule,
    RelationsModule,
    EntitiesModule,
    DtosModule,
    ServicesModule,
    ControllersModule,
    ModulesModule,
    FileIoModule,
    BootstrapModule,
    PgBossModule,
    CodeGenModule
  ],
  controllers: [],
  providers: [HandlebarsService],
  exports: [HandlebarsService],
})
export class AppModule {}
