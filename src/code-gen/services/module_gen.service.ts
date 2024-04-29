import { Injectable } from '@nestjs/common';

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

@Injectable()
export class ModuleGenService {
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

  generateClass(entities: Model[]) {
    let result = new Map<string, string>();
    const moduleTemplate = handleBars.compile(
      `@Module({imports: [TypeOrmModule.forFeature([{{entityName}}]),],controllers: [{{entityName}}Controller],providers: [{{entityName}}Service],})\nexport class {{entityName}}Module {}`,
    );

    for (let entity of entities) {
      let entityName = entity.name;
      let classResult = moduleTemplate({ entityName: entityName });
      result.set(entityName, classResult);
    }

    return result;
  }

  async generateOutPut(entities: Model[], columns: Columns[]) {
    for (const entity of entities) {
      let entityName = entity.name;

      // add common imports and also service and controller of respective entities
      this.imports.set(
        entityName,
        new Set<ImportObject>([
          new ImportObject('Module', "'@nestjs/common'"),
          new ImportObject('TypeOrmModule', "'@nestjs/typeorm'"),
          new ImportObject(`${entityName}Service`, "'src/services'"),
          new ImportObject(`${entityName}Controller`, "'src/controllers'"),
          new ImportObject(`${entityName}`, "'src/entities'"),
        ]),
      );
    }

    const importCode = await this.generateImports(entities, this.imports);
    const classCode = this.generateClass(entities);

    const dataObject = {};

    entities.forEach((entity) => {
      let entityName = entity.name;
      let final = '';

      final += importCode[entityName];
      final += classCode.get(entityName);

      dataObject[entityName] = final;
    });

    return dataObject;
  }
}
