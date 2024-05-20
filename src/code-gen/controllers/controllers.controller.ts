import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ControllersService } from './controllers.service';

@Controller('generate/controllers')
export class ControllersController {
  constructor(private readonly controllersService: ControllersService) {}

  @Get(':modelId')
  async getControllerCodeById(@Param('modelId') modelId: string): Promise<any> {
    return await this.controllersService.generateByModelId(modelId);
  }
}
