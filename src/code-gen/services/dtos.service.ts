import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModelItem } from 'src/database/model/entities/model.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { HandlebarsService } from 'src/handlebars.service';

@Injectable()
export class DtosService {
  private readonly dtoTemplate: string;
  constructor(
    private readonly handlebarsService: HandlebarsService,
    @InjectRepository(ModelItem)
    private readonly modelItemRepository: Repository<ModelItem>,
  ) {
    this.dtoTemplate = fs.readFileSync(
      'src/code-gen/templates/dto-template.hbs',
      'utf8',
    );
  }

  async generateByModelId(modelId: string) {
    const model = await this.modelItemRepository.findOne({
      where: { id: modelId },
      relations: ['columns'],
    });
    if (!model) {
      throw new NotFoundException(`Model with id ${modelId} not found`);
    }

    const properties = model.columns
      .map(function (column) {
        if (!column.isPrimaryKey && !column.isForeignKey) {
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
      ClassName: model.modelName,
      Properties: [...properties],
    };
    console.log('dto:', dto);

    return this.handlebarsService.compileTemplate(this.dtoTemplate, dto);
  }

  async generateAllDTOsByProject(projectModels: ModelItem[]) {
    const generatedDTOs = await Promise.all(
      projectModels.map(async (model) => ({
        [model.modelName]: await this.generateByModelId(model.id),
      })),
    );
    return Object.assign({}, ...generatedDTOs);
  }
}
