import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('generate/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get(':modelId')
  async getServicesByModelId(@Param('modelId') modelId: string) {
    return this.servicesService.getServicesByModelId(modelId);
  }
}
