import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'src/entities/model.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';

import { HandlebarsService } from './handlebars.service';

@Injectable()
export class ServicesService {
  private readonly serviceTemplate: string;
  constructor(
    private readonly handlebarsService: HandlebarsService,

    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
  ) {
    this.serviceTemplate = fs.readFileSync(
      'src/code-gen/templates/service-template.hbs',
      'utf8',
    );
  }

  generateService(className: string) {
    const service = {
      ClassName: className,
    };
    return this.handlebarsService.compileTemplate(
      this.serviceTemplate,
      service,
    );
  }

  generateServices(classNames: string[]) {
    const generatedServices = {};

    classNames.forEach((className) => {
      generatedServices[className] = this.generateService(className);
    });

    return generatedServices;
  }

  async getServicesByModelId(modelId: string) {
    const model = await this.modelRepository.findOne({
      where: { id: modelId },
      relations: ['columns'],
    });
    if (!model) {
      throw new NotFoundException(`Model with id ${modelId} not found`);
    }

    return this.generateService(model.name);
  }
}
