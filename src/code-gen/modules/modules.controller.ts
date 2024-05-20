import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ModulesService } from './modules.service';

@Controller('generate/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get(':modelId')
  getModuleCodeId(@Param('modelId') modelId: string) {
    return this.modulesService.generateByModelId(modelId);
  }
}
