import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';

import { Model } from 'src/entities/model.entity';
import { HandlebarsService } from './handlebars.service';

@Injectable()
export class ControllersService {
  private readonly controllerTemplate: string;
  constructor(
    private readonly handleBarsService: HandlebarsService,

    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
  ) {
    this.controllerTemplate = fs.readFileSync(
      'src/code-gen/templates/controller-template.hbs',
      'utf8',
    );
  }

  generateController(className: string) {
    const controller = {
      ClassName: className,

      // DtoClassName: this.toPascalCase(className) + 'Dto',
      // ServiceClassName: className + 'Service',
    };
    return this.handleBarsService.compileTemplate(
      this.controllerTemplate,
      controller,
    );
  }

  generateControllers(classNames: string[]) {
    const generatedControllers = {};

    classNames.forEach((className) => {
      generatedControllers[className] = this.generateController(className);
    });

    return generatedControllers;
  }

  async generateByModelId(modelId: string) {
    const model = await this.modelRepository.findOne({
      where: { id: modelId },
      relations: ['columns'],
    });
    if (!model) {
      throw new NotFoundException(`Model with id ${modelId} not found`);
    }
    return this.generateController(model.name);
  }

  toPascalCase(str: string): string {
    return str
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}
