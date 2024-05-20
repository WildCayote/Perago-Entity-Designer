import { Module } from '@nestjs/common';
import { BootstrapService } from './bootstrap.service';

import { HandlebarsService } from 'src/handlebars.service';

@Module({
  controllers: [],
  providers: [BootstrapService, HandlebarsService],
  exports: [BootstrapService],
})
export class BootstrapModule {}
