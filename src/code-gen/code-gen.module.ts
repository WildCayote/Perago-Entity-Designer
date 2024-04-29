import { Module } from '@nestjs/common';

import {
  DtoGenService,
  EntityGenService,
  TemplateHandlerRegistry,
  ControllerGenService,
  ServGenService,
  ModuleGenService,
  AppModuleGenService,
} from './services';

import { CodeGenService } from './code_gen.service';

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
  ],
  exports: [CodeGenService],
})
export class CodeGenModule {}
