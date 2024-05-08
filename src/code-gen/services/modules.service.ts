import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'src/entities/model.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';

import { HandlebarsService } from './handlebars.service';

@Injectable()
export class ModulesService {
  private readonly moduleTemplate: string;
  constructor(
    private readonly handlebarsService: HandlebarsService,

    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
  ) {
    this.moduleTemplate = fs.readFileSync(
      'src/code-gen/templates/module-template.hbs',
      'utf8',
    );
  }

  generateModule(modelName: string) {
    const module = {
      ClassName: modelName,
    };
    console.log('module:', module);

    return this.handlebarsService.compileTemplate(this.moduleTemplate, module);
  }

  generateModules(modelNames: string[]) {
    const generatedModules = {};

    modelNames.forEach((modelName) => {
      generatedModules[modelName] = this.generateModule(modelName);
    });

    return generatedModules;
  }

  async generateByModelId(modelId: string) {
    const model = await this.modelRepository.findOne({
      where: { id: modelId },
      relations: ['columns'],
    });
    if (!model) {
      throw new NotFoundException(`Model with id ${modelId} not found`);
    }

    return this.generateModule(model.name);
  }

  toPascalCase(str: string): string {
    return str
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}
