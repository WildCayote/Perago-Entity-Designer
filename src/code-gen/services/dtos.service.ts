import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as fs from 'fs';

import { Model } from 'src/entities/model.entity';
import { HandlebarsService } from './handlebars.service';

@Injectable()
export class DtosService {
  private readonly dtoTemplate: string;
  constructor(
    private readonly handlebarsService: HandlebarsService,
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
  ) {
    this.dtoTemplate = fs.readFileSync(
      'src/code-gen/templates/dto-template.hbs',
      'utf8',
    );
  }

  async generateByModelId(modelId: string) {
    const model = await this.modelRepository.findOne({
      where: { id: modelId },
      relations: ['columns'],
    });
    if (!model) {
      throw new NotFoundException(`Model with id ${modelId} not found`);
    }

    const properties = model.columns
      .map(function (column) {
        if (!column.isPrimary && !column.isForiegn) {
          return {
            Name: column.name,
            Type: column.type,

            Optional: column.isNullable,

            // foreignKey: column.isForeignKey,
          };
        }
      })
      .filter(function (property) {
        return property !== undefined;
      });

    const dto = {
      ClassName: model.name,
      Properties: [...properties],
    };
    console.log('dto:', dto);

    return this.handlebarsService.compileTemplate(this.dtoTemplate, dto);
  }

  async generateAllDTOsByProject(projectModels: Model[]) {
    const generatedDTOs = await Promise.all(
      projectModels.map(async (model) => ({
        [model.name]: await this.generateByModelId(model.id),
      })),
    );
    return Object.assign({}, ...generatedDTOs);
  }
}
