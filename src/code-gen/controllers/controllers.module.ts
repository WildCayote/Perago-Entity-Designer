import { Module } from '@nestjs/common';
import { ControllersService } from './controllers.service';
import { ControllersController } from './controllers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelItem } from 'src/database/model/entities/model.entity';
import { HandlebarsService } from 'src/handlebars.service';

@Module({
  imports: [TypeOrmModule.forFeature([ModelItem])],
  controllers: [ControllersController],
  providers: [ControllersService, HandlebarsService],
  exports: [ControllersService],
})
export class ControllersModule {}
