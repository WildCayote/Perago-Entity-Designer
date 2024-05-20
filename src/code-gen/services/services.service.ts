import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModelItem } from 'src/database/model/entities/model.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { HandlebarsService } from 'src/handlebars.service';
import { importPattern } from 'src/import-pattern';

@Injectable()
export class ServicesService {
  private readonly serviceTemplate: string;
  private readonly barrelTemplate: string;
  constructor(
    private readonly handlebarsService: HandlebarsService,

    @InjectRepository(ModelItem)
    private readonly modelItemRepository: Repository<ModelItem>,
  ) {
    this.serviceTemplate = fs.readFileSync(
      'src/code-gen/templates/service-template.hbs',
      'utf8',
    );
    this.barrelTemplate = fs.readFileSync(
      'src/code-gen/templates/barrel-template.hbs',
      'utf8',
    );
  }

  generateService(className: string, pattern: string = "default") {
    const service = {
      ClassName: className,
      dtoPattern: importPattern[pattern].service.dtoPattern,
      entityPattern: importPattern[pattern].service.entityPattern,
    };
    return this.handlebarsService.compileTemplate(
      this.serviceTemplate,
      service,
    );
  }

  generateServices(classNames: string[], pattern: string = "default") {
    const generatedServices = {};

    classNames.forEach((className) => {
      generatedServices[className] = this.generateService(className, pattern);
    });

    return generatedServices;
  }

  async getServicesByModelId(modelId: string) {
    const model = await this.modelItemRepository.findOne({
      where: { id: modelId },
      relations: ['columns'],
    });
    if (!model) {
      throw new NotFoundException(`Model with id ${modelId} not found`);
    }

    return this.generateService(model.modelName);
  }

  generateBarrel(classNames: string[]) {
    const barrel = {
      files: classNames.map((className) => className + '.service'),
    };

    return this.handlebarsService.compileTemplate(this.barrelTemplate, barrel);
  }
}
