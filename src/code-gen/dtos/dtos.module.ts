import { Module } from '@nestjs/common';
import { DtosService } from './dtos.service';
import { DtosController } from './dtos.controller';
import { ModelItem } from 'src/database/model/entities/model.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HandlebarsService } from 'src/handlebars.service';

@Module({
  imports: [TypeOrmModule.forFeature([ModelItem])],
  controllers: [DtosController],
  providers: [DtosService, HandlebarsService],
  exports: [DtosService],
})
export class DtosModule {}
