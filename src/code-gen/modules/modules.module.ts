import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelItem } from 'src/database/model/entities/model.entity';
import { HandlebarsService } from 'src/handlebars.service';

@Module({
  imports: [TypeOrmModule.forFeature([ModelItem])],
  controllers: [ModulesController],
  providers: [ModulesService, HandlebarsService],
  exports: [ModulesService],
})
export class ModulesModule {}
