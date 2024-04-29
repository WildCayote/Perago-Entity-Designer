import { Module } from '@nestjs/common';

import {
  CodeGenService,
  DtoGenService,
  EntityGenService,
  TemplateHandlerRegistry,
  ControllerGenService,
} from './services';

@Module({
  providers: [
    CodeGenService,
    TemplateHandlerRegistry,
    EntityGenService,
    DtoGenService,
    ControllerGenService,
  ],
  exports: [CodeGenService],
})
export class CodeGenModule {}
