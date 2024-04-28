import { Module } from '@nestjs/common';

import { EntityGenService, TemplateHandlerRegistry } from './services';

import { CodeGenService } from './code-gen.service';

@Module({
  providers: [CodeGenService, TemplateHandlerRegistry, EntityGenService],
  exports: [CodeGenService],
})
export class CodeGenModule {}
