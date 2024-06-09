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
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    // TypeOrmModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     host: configService.get('DATABASE_HOST'),
    //     port: configService.get('DATABASE_PORT'),
    //     username: configService.get('DATABASE_USERNAME'),
    //     password: configService.get('DATABASE_PASSWORD'),
    //     database: configService.get('DATABASE_NAME'),
    //     entities: [Project, Model, Columns, RelationShip],
    //     synchronize: true,
    //   }),
    //   inject: [ConfigService],
    // }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'dawit',
      database: 'perago_db_design',
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
