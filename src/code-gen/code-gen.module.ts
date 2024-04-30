import { Module } from '@nestjs/common';

import {
  DtoGenService,
  EntityGenService,
  TemplateHandlerRegistry,
  ControllerGenService,
  ServGenService,
  ModuleGenService,
  AppModuleGenService,
  BarrelGenService,
} from './services';

import { CodeGenService } from './code_gen.service';
import { MainGenService } from './services/main_gen.service';

@Module({
  providers: [
    CodeGenService,
    TemplateHandlerRegistry,
    EntityGenService,
    DtoGenService,
    ControllerGenService,
    ServGenService,
    ModuleGenService,
    AppModuleGenService,
    BarrelGenService,
    MainGenService,
  ],
  exports: [CodeGenService, BarrelGenService],
})
export class CodeGenModule {}
