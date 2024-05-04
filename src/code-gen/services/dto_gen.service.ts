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
export class DtoGenService {
  private imports = new Map<string, Set<ImportObject>>();

  private generateClass(entities: Model[], fields: Map<string, Set<string>>) {
    const result = new Map<string, string>();

    const createDtoTemplate = handleBars.compile(
      'export class {{name}}CreateDto {\n',
    );

    const updateDtoTemplate = handleBars.compile(
      'export class {{name}}UpdateDto extends PartialType({{name}}CreateDto){}',
    );

    for (const entity of entities) {
      let body = '';

      const entityName = entity.name;
      const fileds = fields.get(entityName);

      for (const field of fileds) body += field;

      const createDtoHead = createDtoTemplate({ name: entityName });
      body = createDtoHead + body + '}\n\n';

      const updateDtoClass = updateDtoTemplate({ name: entityName });
      body += updateDtoClass;

      result.set(entityName, body);
    }

    return result;
  }

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

  private async generateFields(entities: Model[], columns: Columns[]) {
    let fields = new Map<string, Set<string>>();

    const fieldTemplate = handleBars.compile('{{name}} : {{type}};\n\n');

    for (const entity of entities) {
      const entityId = entity.id;
      const entityName = entity.name;

      const entityColumns = columns.filter(
        (column) =>
          column.modelId == entityId && !column.isPrimary && !column.isForiegn,
      );

      for (const column of entityColumns) {
        // determine decorators to add on the field
        // append the filed and its type under the decorators
        let field = '';
        let decorators = '@ApiProperty()\n@IsNotEmpty()\n';

        this.imports.set(
          entityName,
          new Set<ImportObject>([
            new ImportObject('IsNotEmpty', "'class-validator'"),
            new ImportObject('ApiProperty', "'@nestjs/swagger'"),
            new ImportObject('PartialType', "'@nestjs/swagger'"),
          ]),
        );

        switch (column.type) {
          case 'string':
            field = fieldTemplate({ name: column.name, type: 'string' });
            decorators += '@IsString()\n';
            this.imports
              .get(entityName)
              .add(new ImportObject('IsString', "'class-validator'"));
            break;

          case 'number':
            field = fieldTemplate({ name: column.name, type: 'number' });
            decorators += '@IsNumber()\n';
            this.imports
              .get(entityName)
              .add(new ImportObject('IsNumber', "'class-validator'"));
            break;

          case 'bool':
            field = fieldTemplate({ name: column.name, type: 'boolean' });
            decorators += '@IsBoolean()\n';
            this.imports
              .get(entityName)
              .add(new ImportObject('IsBoolean', "'class-validator'"));
            break;
        }

        field = decorators + field;
        if (fields.get(entityName)) fields.get(entityName).add(field);
        else fields.set(entityName, new Set<string>([field]));
      }
    }
    return fields;
  }

  async generateOutPut(entities: Model[], columns: Columns[]) {
    const fields = await this.generateFields(entities, columns);
    const imports = await this.generateImports(entities, this.imports);
    const classes = await this.generateClass(entities, fields);

    let code = new Map<string, string>();
    for (let entity of entities) {
      const entityName = entity.name;
      let temp = imports[entityName] + classes.get(entityName);
      code[entityName] = temp;
    }

    return code;
  }
}
