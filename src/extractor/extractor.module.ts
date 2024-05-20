import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExtractorService } from './extractor.service';
import { PgBossModule } from 'src/pg-boss/pg-boss.module';

import { ColumnItem as Columns } from 'src/database/columns/entities/column.entity';
import { ModelItem as Model } from 'src/database/model/entities/model.entity';
import { ProjectItem as Project } from 'src/database/project/entities/project.entity';
import { ExtractorController } from './extractor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Columns, Model]), PgBossModule],
  providers: [ExtractorService],
  controllers: [ExtractorController],
})
export class ExtractorModule {}
