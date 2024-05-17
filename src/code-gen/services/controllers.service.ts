import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'src/entities/model.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';

import { HandlebarsService } from './handlebars.service';
import { importPattern } from './import-pattern';

@Injectable()
export class ControllersService {
  private readonly controllerTemplate: string;
  private readonly barrelTemplate: string;
  constructor(
    private readonly handleBarsService: HandlebarsService,

    @InjectRepository(Model)
    private readonly modelItemRepository: Repository<Model>,
  ) {
    this.controllerTemplate = fs.readFileSync(
      'src/code-gen/templates/controller-template.hbs',
      'utf8',
    );
    this.barrelTemplate = fs.readFileSync(
      'src/code-gen/templates/barrel-template.hbs',
      'utf8',
    );
  }

  generateController(className: string, pattern: string = 'default') {
    const controller = {
      ClassName: className,
      dtoPattern: importPattern[pattern].controller.dtoPattern,
      servicePattern: importPattern[pattern].controller.servicePattern,

      // DtoClassName: this.toPascalCase(className) + 'Dto',
      // ServiceClassName: className + 'Service',
    };
    return this.handleBarsService.compileTemplate(
      this.controllerTemplate,
      controller,
    );
  }

  generateControllers(classNames: string[], pattern: string = 'default') {
    const generatedControllers = {};

    classNames.forEach((className) => {
      generatedControllers[className] = this.generateController(
        className,
        pattern,
      );
    });

    return generatedControllers;
  }

  async generateByModelId(modelId: string) {
    const model = await this.modelItemRepository.findOne({
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

  generateBarrel(classNames: string[]) {
    const barrel = {
      files: classNames.map((className) => className + '.controller'),
    };

    return this.handleBarsService.compileTemplate(this.barrelTemplate, barrel);
  }
}
