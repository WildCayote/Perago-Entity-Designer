import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModelItem } from 'src/database/model/entities/model.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { HandlebarsService } from 'src/handlebars.service';
import { importPattern } from 'src/import-pattern';

@Injectable()
export class ModulesService {
  private readonly moduleTemplate: string;
  private readonly barrelTemplate: string;
  constructor(
    private readonly handlebarsService: HandlebarsService,

    @InjectRepository(ModelItem)
    private readonly modelItemRepository: Repository<ModelItem>,
  ) {
    this.moduleTemplate = fs.readFileSync(
      'src/code-gen/templates/module-template.hbs',
      'utf8',
    );
    this.barrelTemplate = fs.readFileSync(
      'src/code-gen/templates/barrel-template.hbs',
      'utf8',
    );
  }

  generateBarrel(modelNames: string[]) {
    const data = { files: modelNames.map((modelName) => ( modelName + '.module' )) };
    const barrel = this.handlebarsService.compileTemplate(
      this.barrelTemplate,
      data,
    );  

    return barrel;
  }

  generateModule(modelName: string, pattern: string = 'default') {
    const module = {
      ClassName: modelName,
      controllerPattern: importPattern[pattern].module.controllerPattern,
      entityPattern: importPattern[pattern].module.entityPattern,
      servicePattern: importPattern[pattern].module.servicePattern,
    };
    console.log('module:', module);

    return this.handlebarsService.compileTemplate(this.moduleTemplate, module);
  }

  generateModules(modelNames: string[], pattern: string = 'default') {
    const generatedModules = {};

    modelNames.forEach((modelName) => {
      generatedModules[modelName] = this.generateModule(modelName, pattern);
    });

    return generatedModules;
  }

  async generateByModelId(modelId: string) {
    const model = await this.modelItemRepository.findOne({
      where: { id: modelId },
      relations: ['columns'],
    });
    if (!model) {
      throw new NotFoundException(`Model with id ${modelId} not found`);
    }

    return this.generateModule(model.modelName);
  }

  toPascalCase(str: string): string {
    return str
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}
