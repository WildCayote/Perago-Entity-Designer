import { Module } from '@nestjs/common';

import {
  CodeGenService,
  EntityGenService,
  TemplateHandlerRegistry,
} from './services';

@Module({
  providers: [CodeGenService, TemplateHandlerRegistry, EntityGenService],
  exports: [CodeGenService],
})
export class CodeGenModule {}
