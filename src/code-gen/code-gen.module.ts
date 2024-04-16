import { Module } from '@nestjs/common';
import { CodeGenService, TemplateHandlerRegistry } from './code-gen.service';

@Module({
  providers: [CodeGenService, TemplateHandlerRegistry],
  exports: [CodeGenService],
})
export class CodeGenModule {}
