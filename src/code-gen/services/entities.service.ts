import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import * as fs from 'fs';

import { Columns } from 'src/entities/column.entity';
import { HandlebarsService } from './handlebars.service';
import { ModelService } from 'src/model/model.service';
import { RelationShip } from 'src/entities/relationship.entity';
import { Model } from 'src/entities/model.entity';

@Injectable()
export class EntitiesService {
  private readonly entityTemplate: string;
  private allModels: Model[];

  constructor(
    private readonly modelService: ModelService,
    private readonly handlebarsService: HandlebarsService,

    @InjectRepository(RelationShip)
    private readonly relationShipRepository: Repository<RelationShip>,
  ) {
    // get template file
    this.entityTemplate = fs.readFileSync(
      'src/code-gen/templates/entity-template.hbs',
      'utf8',
    );
  }

  async setUpAllModels() {
    this.allModels = await this.modelService.findAll();
  }

  async generateByModelId(modelId: string) {
    let model = this.allModels.find((model) => model.id === modelId);
    if (!model) {
      this.setUpAllModels();
      model = this.allModels.find((model) => model.id === modelId);
      if (!model) {
        throw new NotFoundException(`Model with id ${modelId} not found`);
      }
    }

    const properties = model.columns
      .filter((column) => !column.isPrimary && !column.isForiegn)
      .map((column) => ({
        Name: column.name,
        Type: column.type,
        Nullable: column.isNullable,
        Unique: column.isUnique,
      }));

    const primaryKey = model.columns.find((column) => column.isPrimary);

    const relationships = await Promise.all(
      model.columns
        .filter((column) => column.isForiegn)
        .map(async (column) => {
          const relation = await this.relationShipRepository.findOne({
            where: {
              columnId: column.id,
            },
            relations: ['referencedColumn'],
          });
          const relatedEntity = this.allModels.find((model) =>
            model.columns.find((col) => col.id === relation.referencedColumnId),
          );
          return {
            ForeignKey: relation.referencedColumn.name,
            RelatedEntity:
              relatedEntity.name.charAt(0).toUpperCase() +
              relatedEntity.name.slice(1),
            RelatedEntityLower:
              relatedEntity.name.charAt(0).toLowerCase() +
              relatedEntity.name.slice(1),
            Name: relation.name,
            RelationshipType: relation.type,
            Type: column.type,
          };
        }),
    );
    console.log('relationships:', relationships);

    const table = {
      ClassName: model.name,
      ClassNameLower: model.name.charAt(0).toLowerCase() + model.name.slice(1),
      PrimaryKey: primaryKey.name,
      PrimaryKeyType: primaryKey.type,
      Properties: properties,
      Relationships: relationships,
    };

    return this.handlebarsService.compileTemplate(this.entityTemplate, table);
  }

  async generateAllEntities(projectId: string) {
    this.allModels = await this.modelService.findAll();

    const projectModels = this.allModels.filter(
      (model) => model.project.id === projectId,
    );
    const projectName = projectModels[0].project.name;
    const projectDescription = projectModels[0].project.description;

    if (!projectModels.length) {
      this.setUpAllModels();
      return this.generateAllEntities(projectId);
    }

    const generatedEntities = await Promise.all(
      projectModels.map(async (model) => ({
        [model.name]: await this.generateByModelId(model.id),
      })),
    );

    return [
      Object.assign({ projectModels: projectModels }, ...generatedEntities),
      { projectName, projectDescription },
    ];
  }
}
