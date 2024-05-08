import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModelItem } from 'src/database/model/entities/model.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { HandlebarsService } from 'src/handlebars.service';

@Injectable()
export class ModulesService {
  private readonly moduleTemplate: string;
  constructor(
    private readonly handlebarsService: HandlebarsService,

    @InjectRepository(ModelItem)
    private readonly modelItemRepository: Repository<ModelItem>,
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
