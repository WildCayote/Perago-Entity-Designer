import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  HandlebarsService,
  EntitiesService,
  DtosService,
  ControllersService,
  ServicesService,
  ModulesService,
  BootstrapService,
} from './services';

import { CodeGenService } from './code-gen.service';
import { ModelModule } from 'src/model/model.module';
import { Model } from 'src/entities/model.entity';
import { RelationShip } from 'src/entities/relationship.entity';

@Module({
  imports: [
    forwardRef(() => ModelModule),
    TypeOrmModule.forFeature([Model, RelationShip]),
  ],
  providers: [
    HandlebarsService,
    EntitiesService,
    DtosService,
    ControllersService,
    ServicesService,
    ModulesService,
    BootstrapService,
    CodeGenService,
  ],
  exports: [CodeGenService],
})
export class CodeGenModule {}
