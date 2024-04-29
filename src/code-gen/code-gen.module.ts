import { Module } from '@nestjs/common';

import {
  DtoGenService,
  EntityGenService,
  TemplateHandlerRegistry,
  ControllerGenService,
  ServGenService,
  ModuleGenService,
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
  ],
  exports: [CodeGenService],
})
export class CodeGenModule {}
