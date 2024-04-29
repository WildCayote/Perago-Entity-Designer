import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';

import * as handleBars from 'handlebars';

class ImportObject {
  constructor(
    public module: string,
    public dependency: string,
  ) {}

  equals(otherInstance: ImportObject) {
    return (
      this.module == otherInstance.module &&
      this.dependency == otherInstance.dependency
    );
  }
}

class ReferenceObject {
  constructor(
    public entityName: string,
    public referenceName: string,
    public primaryColumn: string,
    public foreignColumn: string,
  ) {}

  equals(otherInstance: ReferenceObject) {
    return (
      this.entityName == otherInstance.entityName &&
      this.referenceName == otherInstance.referenceName &&
      this.primaryColumn == otherInstance.primaryColumn &&
      this.foreignColumn == otherInstance.foreignColumn
    );
  }
}

@Injectable()
export class ControllerGenService {
  private imports = new Map<string, Set<ImportObject>>();

  private async generateImports(
    entities: Model[],
    imports: Map<string, Set<ImportObject>>,
  ) {
    const dependencyModuleMap = new Map<
      string,
      Map<string, Map<string, ImportObject>>
    >([]);
    const importStatements = handleBars.compile(
      `import { {{#each modules}}{{this}}{{#unless @last}}, {{/unless}}{{/each}} } from {{{dependency}}};\n
\n`,
    );
    for (const entity of entities) {
      const entityName = entity.name;
      const entityImports = imports.get(entityName);
      if (entityImports) {
        for (const entityImport of entityImports) {
          // check if the entity is being tracked , if not track it
          if (!dependencyModuleMap[entityName])
            dependencyModuleMap[entityName] = new Map<string, any>();

          // check if the dependecy is being tracked , if not track it
          if (!dependencyModuleMap[entityName][entityImport.dependency])
            dependencyModuleMap[entityName][entityImport.dependency] =
              new Set<string>([entityImport.module]);
          else
            dependencyModuleMap[entityName][entityImport.dependency].add(
              entityImport.module,
            );
        }
      }
    }

    let result = new Map<string, string>();

    for (let entity of entities) {
      const entityName = entity.name;
      const dependencyMap = dependencyModuleMap[entityName];

      if (dependencyMap) {
        for (const dependency of Object.keys(dependencyMap)) {
          const modules = dependencyMap[dependency];

          if (!result[entityName]) result[entityName] = '';

          result[entityName] += importStatements({
            modules: modules,
            dependency: dependency,
          });
        }
      }
    }
    return result;
  }

  private handleGet(
    relations: Map<string, Set<ReferenceObject>>,
    primaryCols: Map<string, Set<Columns>>,
  ): Map<string, string> {
    const simpleGetAllHandler = handleBars.compile(
      `@Get('{{entityName}}s/')\ngetAll{{entityName}}s() { return this.{{entityName}}Service.getAll(); }\n\n`,
    );

    const simpleGetHandler = handleBars.compile(
      `@Get('{{entityName}}s/:{{primaryCol}}')\nget{{entityName}}(@Param('{{primaryCol}}') {{primaryCol}}) { return this.{{entityName}}Service.getOne({{primaryCol}}); }\n\n`,
    );

    const complexGetAllHandler = handleBars.compile(
      `@Get('{{referenceName}}s/:{{foreignColumn}}/{{entityName}}s/')\ngetAll{{entityName}}s(@Param('{{foreignColumn}}') {{foreignColumn}}) { return this.{{entityName}}Service.getAll({{foreignColumn}}); }\n\n`,
    );

    const complexGetHandler = handleBars.compile(
      `@Get('{{referenceName}}s/:{{foreignColumn}}/{{entityName}}s/:{{primaryColumn}}')\nget{{entityName}}(@Param('{{foreignColumn}}') {{foreignColumn}} , @Param('{{primaryColumn}}') {{primaryColumn}}) { return this.{{entityName}}Service.getOne({{foreignColumn}} , {{primaryColumn}}); }\n\n`,
    );

    let result = new Map<string, string>();

    for (const [key, value] of primaryCols.entries()) {
      let currentRelation = relations.get(key);
      let currentPrimary = value;

      result.set(key, '');

      this.imports.get(key).add(new ImportObject('Get', "'@nestjs/common'"));
      this.imports.get(key).add(new ImportObject('Param', "'@nestjs/common'"));

      if (currentRelation.size) {
        for (let relation of currentRelation.values()) {
          let getAllCode = complexGetAllHandler({
            referenceName: relation.referenceName,
            foreignColumn: relation.foreignColumn,
            entityName: relation.entityName,
          });
          let getCode = complexGetHandler({
            referenceName: relation.referenceName,
            foreignColumn: relation.foreignColumn,
            entityName: relation.entityName,
            primaryColumn: relation.primaryColumn,
          });

          let oldCode = result.get(key);
          oldCode += getAllCode + getCode;
          result.set(key, oldCode);
        }
      } else if (currentPrimary.size) {
        let primaryName = '';
        for (let col of currentPrimary.values()) {
          primaryName = col.name;
        }
        let getAllCode = simpleGetAllHandler({ entityName: key });
        let getCode = simpleGetHandler({
          entityName: key,
          primaryCol: primaryName,
        });

        let oldCode = result.get(key);
        oldCode += getAllCode + getCode;
        result.set(key, oldCode);
      } else {
        throw new InternalServerErrorException(
          `Your design has a problem , the entity ${key} has a problem!`,
        );
      }
    }

    return result;
  }

  private handlePost(
    relations: Map<string, Set<ReferenceObject>>,
    primaryCols: Map<string, Set<Columns>>,
  ) {
    const simplePostHandler = handleBars.compile(
      `@Post('{{entityName}}s/')\ncreate{{entityName}}(@Body() data : {{entityName}}CreateDto) { return this.{{entityName}}Service.create(data); }\n\n`,
    );
    const complexPostHandler = handleBars.compile(
      `@Post('{{referenceName}}s/:{{foreignColumn}}/{{entityName}}s')\ncreate{{entityName}}(@Body() data : {{entityName}}CreateDto , @Param('{{foreignColumn}}') {{foreignColumn}}) { return this.{{entityName}}Service.create({{foreignColumn}} , data); }\n\n`,
    );

    let result = new Map<string, string>();

    for (const [key, value] of primaryCols.entries()) {
      let currentRelation = relations.get(key);
      let currentPrimary = value;

      result.set(key, '');

      this.imports.get(key).add(new ImportObject('Post', "'@nestjs/common'"));
      this.imports.get(key).add(new ImportObject('Param', "'@nestjs/common'"));
      this.imports.get(key).add(new ImportObject('Body', "'@nestjs/common'"));

      if (currentRelation.size) {
        for (let relation of currentRelation.values()) {
          let postCode = complexPostHandler({
            referenceName: relation.referenceName,
            foreignColumn: relation.foreignColumn,
            entityName: relation.entityName,
          });

          let oldCode = result.get(key);
          oldCode += postCode;
          result.set(key, oldCode);
        }
      } else if (currentPrimary.size) {
        let postCode = simplePostHandler({
          entityName: key,
        });

        let oldCode = result.get(key);
        oldCode += postCode;
        result.set(key, oldCode);
      } else {
        throw new InternalServerErrorException(
          `Your design has a problem , the entity ${key} has a problem!`,
        );
      }
    }

    return result;
  }

  private handlePatch(
    relations: Map<string, Set<ReferenceObject>>,
    primaryCols: Map<string, Set<Columns>>,
  ) {
    const simplePatchHandler = handleBars.compile(
      `@Patch('{{entityName}}s/:{{primaryCol}}')\nupdate{{entityName}}(@Body() data : {{entityName}}UpdateDto , @Param('{{primaryCol}}') {{primaryCol}}) { return this.{{entityName}}Service.update({{primaryCol}} , data); }\n\n`,
    );
    const complexPostHandler = handleBars.compile(
      `@Patch('{{referenceName}}s/:{{foreignColumn}}/{{entityName}}s/:{{primaryCol}}')\nupdate{{entityName}}(@Body() data : {{entityName}}UpdateDto , @Param('{{foreignColumn}}') {{foreignColumn}} , @Param('{{primaryCol}}') {{primaryCol}}) { return this.{{entityName}}Service.update({{foreignColumn}}, {{primaryCol}}, data); }\n\n`,
    );

    let result = new Map<string, string>();

    for (const [key, value] of primaryCols.entries()) {
      let currentRelation = relations.get(key);
      let currentPrimary = value;

      result.set(key, '');

      this.imports.get(key).add(new ImportObject('Patch', "'@nestjs/common'"));
      this.imports.get(key).add(new ImportObject('Param', "'@nestjs/common'"));
      this.imports.get(key).add(new ImportObject('Body', "'@nestjs/common'"));

      if (currentRelation.size) {
        for (let relation of currentRelation.values()) {
          let patchCode = complexPostHandler({
            referenceName: relation.referenceName,
            foreignColumn: relation.foreignColumn,
            entityName: relation.entityName,
            primaryCol: relation.primaryColumn,
          });

          let oldCode = result.get(key);
          oldCode += patchCode;
          result.set(key, oldCode);
        }
      } else if (currentPrimary.size) {
        let primaryName = '';
        for (let col of currentPrimary.values()) {
          primaryName = col.name;
        }
        let patchCode = simplePatchHandler({
          entityName: key,
          primaryCol: primaryName,
        });

        let oldCode = result.get(key);
        oldCode += patchCode;
        result.set(key, oldCode);
      } else {
        throw new InternalServerErrorException(
          `Your design has a problem , the entity ${key} has a problem!`,
        );
      }
    }

    return result;
  }

  private handleDelete(
    relations: Map<string, Set<ReferenceObject>>,
    primaryCols: Map<string, Set<Columns>>,
  ) {
    const simpleDeleteHandler = handleBars.compile(
      `@Delete('{{entityName}}s/:{{primaryCol}}')\ndelete{{entityName}}(@Param('{{primaryCol}}') {{primaryCol}}) { return this.{{entityName}}Service.delete({{primaryCol}}); }\n\n`,
    );
    const complexDeleteHandler = handleBars.compile(
      `@Delete('{{referenceName}}s/:{{foreignColumn}}/{{entityName}}s/:{{primaryColumn}}')\ndelete{{entityName}}(@Param('{{foreignColumn}}') {{foreignColumn}} , @Param('{{primaryColumn}}') {{primaryColumn}}) { return this.{{entityName}}Service.delete({{foreignColumn}} , {{primaryColumn}}); }\n\n`,
    );

    let result = new Map<string, string>();

    for (const [key, value] of primaryCols.entries()) {
      let currentRelation = relations.get(key);
      let currentPrimary = value;

      result.set(key, '');

      this.imports.get(key).add(new ImportObject('Delete', "'@nestjs/common'"));
      this.imports.get(key).add(new ImportObject('Param', "'@nestjs/common'"));

      if (currentRelation.size) {
        for (let relation of currentRelation.values()) {
          let deleteCode = complexDeleteHandler({
            referenceName: relation.referenceName,
            foreignColumn: relation.foreignColumn,
            entityName: relation.entityName,
            primaryColumn: relation.primaryColumn,
          });

          let oldCode = result.get(key);
          oldCode += deleteCode;
          result.set(key, oldCode);
        }
      } else if (currentPrimary.size) {
        let primaryName = '';
        for (let col of currentPrimary.values()) {
          primaryName = col.name;
        }
        let deleteCode = simpleDeleteHandler({
          entityName: key,
          primaryCol: primaryName,
        });

        let oldCode = result.get(key);
        oldCode += deleteCode;
        result.set(key, oldCode);
      } else {
        throw new InternalServerErrorException(
          `Your design has a problem , the entity ${key} has a problem!`,
        );
      }
    }

    return result;
  }

  private generateClass(entityName: string, imports: string, body: string) {
    const classTemplate = handleBars.compile(
      `@Controller()\nexport class {{entityName}}Controller {\nconstructor(private {{entityName}}Service: {{entityName}}Service) {}\n\n`,
    );

    let result = '';
    const classHead = classTemplate({ entityName: entityName });

    result += imports;
    result += classHead;
    result += body;
    result += '}';

    return result;
  }

  async generateOutPut(entities: Model[], columns: Columns[]) {
    let relations = new Map<string, Set<ReferenceObject>>();
    let primaryCols = new Map<string, Set<Columns>>();

    for (const entity of entities) {
      let entityName = entity.name;
      let entityId = entity.id;
      relations.set(entityName, new Set<ReferenceObject>([]));
      primaryCols.set(entityName, new Set<Columns>([]));

      // imports common to every entity and also respective services
      this.imports.set(
        entityName,
        new Set<ImportObject>([
          new ImportObject('Controller', "'@nestjs/common'"),
          new ImportObject(`${entityName}Service`, "'src/services'"),
          new ImportObject(`${entityName}CreateDto`, "'src/dtos'"),
          new ImportObject(`${entityName}UpdateDto`, "'src/dtos'"),
        ]),
      );

      for (const column of columns) {
        let columnModelId = column.modelId;
        if (columnModelId == entityId && column.isForiegn) {
          const relation = column.relation;
          const referencedColumn = columns.find(
            (column) => column.id == relation.referencedColumnId,
          );
          const referencedEntity = entities.find(
            (entity) => entity.id == referencedColumn.modelId,
          );

          // create and add the reference object
          relations
            .get(entityName)
            .add(
              new ReferenceObject(
                entityName,
                referencedEntity.name,
                referencedColumn.name,
                column.name,
              ),
            );
        } else if (columnModelId == entityId && column.isPrimary) {
          primaryCols.get(entityName).add(column);
        }
      }
    }

    const postCode = this.handlePost(relations, primaryCols);
    const patchCode = this.handlePatch(relations, primaryCols);
    const getCode = this.handleGet(relations, primaryCols);
    const deleteCode = this.handleDelete(relations, primaryCols);

    const importCode = await this.generateImports(entities, this.imports);

    const dataObject = {};

    entities.forEach((entity) => {
      let entityName = entity.name;
      let body = '';

      body += getCode.get(entityName);
      body += postCode.get(entityName);
      body += patchCode.get(entityName);
      body += deleteCode.get(entityName);

      let code = this.generateClass(entityName, importCode[entityName], body);

      dataObject[entityName] = code;
    });

    return dataObject;
  }
}
