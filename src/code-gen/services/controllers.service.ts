import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModelItem } from 'src/database/model/entities/model.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { HandlebarsService } from 'src/handlebars.service';

@Injectable()
export class ControllersService {
  private readonly controllerTemplate: string;
  constructor(
    private readonly handleBarsService: HandlebarsService,

    @InjectRepository(ModelItem)
    private readonly modelItemRepository: Repository<ModelItem>,
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
    const model = await this.modelItemRepository.findOne({
      where: { id: modelId },
      relations: ['columns'],
    });
    if (!model) {
      throw new NotFoundException(`Model with id ${modelId} not found`);
    }
    return this.generateController(model.modelName);
  }

  toPascalCase(str: string): string {
    return str
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}
