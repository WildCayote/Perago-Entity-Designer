import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'src/entities/model.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { RelationShip } from 'src/entities/relationship.entity';
import { HandlebarsService } from './handlebars.service';
import { ModelService } from 'src/model/model.service';
import { toKebabCase } from 'js-convert-case';

@Injectable()
export class EntitiesService {
  private readonly entityTemplate: string;
  private readonly barrelTemplate: string;
  private allModels: Model[];

  constructor(
    private readonly modelService: ModelService,
    private readonly handlebarsService: HandlebarsService,

    @InjectRepository(RelationShip)
    private readonly relationItemRepository: Repository<RelationShip>,
  ) {
    // get template file
    this.entityTemplate = fs.readFileSync(
      'src/code-gen/templates/entity-template.hbs',
      'utf8',
    );
    this.barrelTemplate = fs.readFileSync(
      'src/code-gen/templates/barrel-template.hbs',
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

    // getting all the normal columns , ones that aren't primary nor foriegn key columns
    const properties = model.columns
      .filter((column) => !column.isPrimary && !column.isForiegn)
      .map((column) => ({
        Name: column.name,
        Type: column.type,
        Nullable: column.isNullable,
        Unique: column.isUnique,
      }));

    // find the primary key
    const primaryKey = model.columns.find((column) => column.isPrimary);
    console.log('Primary key: ', primaryKey);

    const relationships = await Promise.all(
      model.columns
        .filter((column) => column.isForiegn || column.references.length > 0)
        .map(async (column) => {
          const relation = await this.relationItemRepository.findOne({
            where: {
              columnId: column.id,
            },
            relations: ['referencedColumn'],
          });

          console.log('*********** ', column.name, ' ********', relation);

          const relatedEntity = this.allModels.find((model) =>
            model.columns.find((col) => col.id === relation.referencedColumnId),
          );
          return {
            ForeignKey: this.removeSpaces(relation.referencedColumn.name),
            RelatedEntity: this.removeSpaces(
              relatedEntity.name.charAt(0).toUpperCase() +
                relatedEntity.name.slice(1),
            ),
            RelatedEntityLower: this.removeSpaces(
              relatedEntity.name.charAt(0).toLowerCase() +
                relatedEntity.name.slice(1),
            ),
            Name: this.removeSpaces(column.name),
            ReversedName: this.removeSpaces(
              relation.name == null ? '' : relation.name,
            ),
            RelationshipType: relation.type,
            Type: column.type,
          };
        }),
    );
    console.log('relationships: ', relationships);

    const table = {
      ClassName: model.name,
      // ClassName: model.name,
      // ClassNameLower: model.name.charAt(0).toLowerCase() + model.name.slice(1),
      ClassNameLower: this.toCamelCase(model.name),
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

  generateBarrel(classNames: string[]) {
    const barrel = {
      files: classNames.map((className) => toKebabCase(className) + '.entity'),
    };
    return this.handlebarsService.compileTemplate(this.barrelTemplate, barrel);
  }

  removeSpaces(str: string): string {
    return str.replace(/\s+/g, '');
  }

  toCamelCase(str: string): string {
    if (/^[a-z][a-zA-Z0-9]*$/.test(str)) {
      return str;
    }
    // Split the string into words
    const words = str.split(/\s+/);
    // Convert the first word to lowercase and capitalize the first letter of subsequent words
    const camelCaseStr = words
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join('');

    return camelCaseStr;
  }
}
