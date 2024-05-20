import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelItem } from 'src/database/model/entities/model.entity';
import { HandlebarsService } from 'src/handlebars.service';

@Module({
  imports: [TypeOrmModule.forFeature([ModelItem])],
  controllers: [ServicesController],
  providers: [ServicesService, HandlebarsService],
  exports: [ServicesService],
})
export class ServicesModule {}
