import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DtosService } from './dtos.service';

@Controller('generate/dtos')
export class DtosController {
  constructor(private readonly dtosService: DtosService) {}

  @Get(':modelId')
  async getDTOCodeByModel(@Param('modelId') modelId: string): Promise<any> {
    return await this.dtosService.generateByModelId(modelId);
  }

  // @Get('project/:projectId')
  // async getAllDTOsByProject(
  //   @Param('projectId') projectId: string,
  // ): Promise<any> {
  //   return await this.dtosService.generateAllDTOsByProject(projectId);
  // }
}
