import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExtractorService } from './extractor.service';
import { PgBossModule } from 'src/pg-boss/pg-boss.module';

import { Project } from 'src/entities/project.entity';
import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';
import { ExtractorController } from './extractor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Columns, Model]), PgBossModule],
  providers: [ExtractorService],
  controllers: [ExtractorController],
})
export class ExtractorModule {}
