import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModelItem } from 'src/database/model/entities/model.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { HandlebarsService } from 'src/handlebars.service';

@Injectable()
export class ServicesService {
  private readonly serviceTemplate: string;
  constructor(
    private readonly handlebarsService: HandlebarsService,

    @InjectRepository(ModelItem)
    private readonly modelItemRepository: Repository<ModelItem>,
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
    const model = await this.modelItemRepository.findOne({
      where: { id: modelId },
      relations: ['columns'],
    });
    if (!model) {
      throw new NotFoundException(`Model with id ${modelId} not found`);
    }

    return this.generateService(model.modelName);
  }
}
