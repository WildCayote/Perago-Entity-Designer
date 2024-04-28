import { Module } from '@nestjs/common';

import {
  CodeGenService,
  DtoGenService,
  EntityGenService,
  TemplateHandlerRegistry,
} from './services';

@Module({
  providers: [
    CodeGenService,
    TemplateHandlerRegistry,
    EntityGenService,
    DtoGenService,
  ],
  exports: [CodeGenService],
})
export class CodeGenModule {}
