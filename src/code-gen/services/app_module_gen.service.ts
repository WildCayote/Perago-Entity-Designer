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
export class AppModuleGenService {
  private imports = new Map<string, Set<ImportObject>>();

  private async generateImports(
    entities: string[],
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
      const entityName = entity;
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
      const entityName = entity;
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

  async addImports(entities: Model[]) {
    // add common imports
    this.imports.set(
      'appImports',
      new Set<ImportObject>([
        new ImportObject('Module', "'@nestjs/common'"),
        new ImportObject('TypeOrmModule', "'@nestjs/typeorm'"),
      ]),
    );

    for (const entity of entities) {
      let entityName = entity.name;

      // add respective modules and entities
      await this.imports
        .get('appImports')
        .add(
          new ImportObject(
            `${entityName}Module`,
            `'src/${entityName}/${entityName.toLowerCase()}.module'`,
          ),
        );

      await this.imports
        .get('appImports')
        .add(new ImportObject(`${entityName}`, "'src/entities'"));
    }
  }

  createClass(entities: Model[]) {
    const classTemplate = handleBars.compile(
      `@Module({imports: [TypeOrmModule.forRoot({type: 'postgres',host: 'localhost',port: 5433,username: 'YOUR_USER_NAME',password: 'YOUR_PASSWORD',database: 'YOUR_DATABASE_NAME',entities: [{{#each entities}} {{name}},{{/each}}],synchronize: true,}),{{#each entities}}{{name}}Module, {{/each}}],})\nexport class AppModule {}`,
    );

    const result = classTemplate({ entities: entities });

    return result;
  }

  async generateOutPut(entities: Model[], columns: Columns[]) {
    await this.addImports(entities);

    const importCode = await this.generateImports(['appImports'], this.imports);
    const classCode = this.createClass(entities);

    const result = importCode['appImports'] + classCode;

    return result;
  }
}
