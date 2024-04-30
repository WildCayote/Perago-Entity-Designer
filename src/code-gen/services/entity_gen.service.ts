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

interface TemplateHandler {
  imports: Map<string, Set<ImportObject>>;
  generate(entities: Model[], columns: Columns[]): Map<string, string>;
  addImport(entityName: string, dependency: ImportObject): void;
  getImports(): Map<string, Set<ImportObject>>;
}

class PrimaryColumnHandler implements TemplateHandler {
  imports = new Map<string, Set<ImportObject>>([]);

  uuidTemplateFunction = handleBars.compile(
    `@PrimaryGeneratedColumn('uuid')\n{{column.name}} : string\n\n`,
  );

  incremetnTemplateFunction = handleBars.compile(
    `@PrimaryGeneratedColumn()\n{{column.name}} : number\n\n`,
  );

  generate(entities: Model[], columns: Columns[]): Map<string, string> {
    const map = new Map<string, string>();

    // find primary columns for each entity
    for (const entity of entities) {
      let entityOutPut = '';
      for (const column of columns) {
        if (column.modelId == entity.id && column.isPrimary) {
          switch (column.type) {
            case 'string':
              entityOutPut += this.uuidTemplateFunction({ column });
              this.addImport(
                entity.name,
                new ImportObject('PrimaryGeneratedColumn', `'typeorm'`),
              );
              break;
            case 'number':
              entityOutPut += this.incremetnTemplateFunction({ column });
              this.addImport(
                entity.name,
                new ImportObject('PrimaryGeneratedColumn', `'typeorm'`),
              );
              break;
          }
        }

        map.set(entity.name, entityOutPut);
      }
    }

    return map;
  }

  addImport(entityName: string, dependency: ImportObject): void {
    if (!this.imports[entityName])
      this.imports[entityName] = new Set<ImportObject>([dependency]);
    this.imports[entityName].add(dependency);
  }

  getImports(): Map<string, Set<ImportObject>> {
    return this.imports;
  }
}

class SimpleColumnHandler implements TemplateHandler {
  imports = new Map<string, Set<ImportObject>>([]);

  normalColTemplateFunction = handleBars.compile(
    `@Column({ name: '{{column.name}}', {{#if column.isUnique}}, unique: true{{/if}} })
{{column.name}} : {{column.type}};
\n`,
  );

  generate(entities: Model[], columns: Columns[]): Map<string, string> {
    const map = new Map<string, string>();

    for (const entity of entities) {
      let entityOutPut = '';
      for (const column of columns) {
        if (
          column.modelId == entity.id &&
          !column.isForiegn &&
          !column.isPrimary
        ) {
          entityOutPut += this.normalColTemplateFunction({ column });
          this.addImport(entity.name, new ImportObject('Column', `'typeorm'`));
        }
      }

      map.set(entity.name, entityOutPut);
    }

    return map;
  }

  addImport(entityName: string, dependency: ImportObject): void {
    if (!this.imports[entityName])
      this.imports[entityName] = new Set<ImportObject>([dependency]);
    this.imports[entityName].add(dependency);
  }

  getImports(): Map<string, Set<ImportObject>> {
    return this.imports;
  }
}

class RelationColumnHandler implements TemplateHandler {
  imports = new Map<string, Set<ImportObject>>([]);

  _ = handleBars.registerHelper('camelCase', function (str) {
    const pattern = /[ _-]/;
    const words = str.split(pattern);
    const camelCaseWords = words.map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      } else {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    });
    return camelCaseWords.join('');
  });

  oneToOneFunction = handleBars.compile(
    `
    @Column({name : '{{column.name}}'})\n
{{column.name}} : {{column.type}}\n
@OneToOne((type) => {{referencedEntity}}, ({{camelCase referencedEntity}}) => {{camelCase referencedEntity}}.{{camelCase currentEntity}} , { {{#if relation.eager}} eager : {{relation.eager}} {{/if}} , {{#if relation.nullable}} nullable : {{relation.nullable}}{{/if}} })\n
@JoinColumn({name : '{{column.name}}' , referencedColumnName: '{{referencedColumn}} })
{{camelCase referencedEntity}}: {{referencedEntity}}
\n`,
  );
  onetToOneReverseFunction = handleBars.compile(
    `@OneToOne((type) => {{referencingEntity}} , ({{camelCase referencingEntity}}) => {{camelCase referencingEntity}})
{{camelCase referencingEntity}} : {{referencingEntity}}
\n`,
  );

  oneToManyFunction = handleBars.compile(``);
  oneTomanyReverseFunction = handleBars.compile('');

  manyToOneFunction = handleBars.compile(
    `@Column({ name: '{{column.name}}' })
{{column.name}}: {{column.type}};
\n@ManyToOne((type) => {{referencedEntity}}, ({{camelCase referencedEntity}}) => {{camelCase referencedEntity}}.{{camelCase currentEntity }}s , { {{#if relation.eager}} eager : {{relation.eager}} {{/if}} , {{#if relation.nullable}} nullable : {{relation.nullable}}{{/if}} })
@JoinColumn({ name: '{{column.name}}', referencedColumnName: '{{referencedColumn}}' })
{{camelCase referencedEntity}}: {{referencedEntity}};
\n`,
  );
  manyToOneReverseFunction = handleBars.compile(
    `@OneToMany((type) => {{referencingEntity}},({{camelCase referencingEntity}}) => {{camelCase referencingEntity}}.{{camelCase referencedEntity}} {{#if relation.eager}} , { eager : {{relation.eager}} } {{/if}})
{{camelCase referencingEntity}}s : {{referencingEntity}}[];
\n`,
  );

  generate(entities: Model[], columns: Columns[]): Map<string, string> {
    const map = new Map<string, string>();

    for (const entity of entities) {
      let entityOutPut = '';
      for (const column of columns) {
        // handle foriegn key side
        if (column.modelId == entity.id && column.isForiegn) {
          const referencedColumn = columns.find(
            (item) => column.relation.referencedColumnId == item.id,
          );

          const referencedModel = entities.find(
            (item) => item.id == referencedColumn.modelId,
          );

          this.addImport(
            entity.name,
            new ImportObject('JoinColumn', `'typeorm'`),
          );

          switch (column.relation.type) {
            case 'one-to-one':
              entityOutPut += this.oneToOneFunction({
                column: column,
                referencedEntity: referencedModel.name,
                relation: column.relation,
              });

              this.addImport(
                entity.name,
                new ImportObject('OneToOne', `'typeorm'`),
              );

              this.addImport(
                entity.name,
                new ImportObject(
                  referencedModel.name,
                  `'./${referencedModel.name.toLocaleLowerCase()}.entity'`,
                ),
              );

              break;
            case 'one-to-many':
              console.log(column.name);
              break;
            case 'many-to-one':
              entityOutPut += this.manyToOneFunction({
                column: column,
                referencedEntity: referencedModel.name,
                relation: column.relation,
                currentEntity: entity.name,
                referencedColumn: referencedColumn.name,
              });

              this.addImport(
                entity.name,
                new ImportObject('ManyToOne', `'typeorm'`),
              );

              this.addImport(
                entity.name,
                new ImportObject(
                  referencedModel.name,
                  `'./${referencedModel.name.toLocaleLowerCase()}.entity'`,
                ),
              );

              break;
          }
        }

        // handle reverse side
        if (column.modelId == entity.id && column.references.length > 0) {
          for (const reference of column.references) {
            const referencedColumn = columns.find(
              (item) => item.id == reference.referencedColumnId,
            );

            const referencingColumn = columns.find(
              (item) => item.id == reference.columnId,
            );

            const referencingModel = entities.find(
              (item) => item.id == referencingColumn.modelId,
            );

            const referencedModel = entities.find(
              (item) => item.id == referencedColumn.modelId,
            );

            switch (reference.type) {
              case 'one-to-one':
                entityOutPut += this.onetToOneReverseFunction({
                  referencingEntity: referencingModel.name,
                  referencedEntity: referencedModel.name,
                });

                this.addImport(
                  entity.name,
                  new ImportObject('OneToOne', `'typeorm'`),
                );

                this.addImport(
                  entity.name,
                  new ImportObject(
                    referencingModel.name,
                    `./${referencingModel.name.toLocaleLowerCase()}.entity`,
                  ),
                );

                break;
              case 'one-to-many':
                console.log(column.name);
                break;
              case 'many-to-one':
                entityOutPut += this.manyToOneReverseFunction({
                  referencingEntity: referencingModel.name,
                  referencedEntity: referencedModel.name,
                  reference: reference,
                });

                this.addImport(
                  entity.name,
                  new ImportObject(
                    referencingModel.name,
                    `'./${referencingModel.name.toLocaleLowerCase()}.entity'`,
                  ),
                );
                this.addImport(
                  entity.name,
                  new ImportObject('OneToMany', `'typeorm'`),
                );

                break;
            }
          }
        }
      }

      map.set(entity.name, entityOutPut);
    }

    return map;
  }

  addImport(entityName: string, dependency: ImportObject): void {
    if (!this.imports[entityName])
      this.imports[entityName] = new Set<ImportObject>([dependency]);
    this.imports[entityName].add(dependency);
  }

  getImports(): Map<string, Set<ImportObject>> {
    return this.imports;
  }
}

@Injectable()
export class TemplateHandlerRegistry {
  private handlers: Map<string, TemplateHandler> = new Map();

  registerHandler(type: string, handler: TemplateHandler): void {
    this.handlers.set(type, handler);
  }

  getHandler(type: string): TemplateHandler | undefined {
    return this.handlers.get(type);
  }
}

@Injectable()
export class EntityGenService {
  private execOrder: string[];
  private imports: Map<string, Set<ImportObject>>;

  constructor(private readonly registry: TemplateHandlerRegistry) {
    this.registerDefualtHandlers();
  }

  private registerDefualtHandlers(): void {
    this.registry.registerHandler('columns', new SimpleColumnHandler());
    this.registry.registerHandler('relations', new RelationColumnHandler());
    this.registry.registerHandler('primaryCols', new PrimaryColumnHandler());

    this.execOrder = ['primaryCols', 'columns', 'relations'];
    this.imports = new Map<string, Set<ImportObject>>();
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
      const entityImports = imports[entityName];
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

  private generateClass(entityName: string) {
    const classTemplateFunction = handleBars.compile(
      `@Entity()
export class {{entityName}} {\n`,
    );

    return classTemplateFunction({ entityName: entityName });
  }

  async generateOutPut(entities: Model[], columns: Columns[]) {
    const codeObject: Record<string, any> = {};

    for (const entity of entities) {
      codeObject[entity.name] = '';
      this.imports[entity.name] = new Set();
      this.imports[entity.name].add(new ImportObject('Entity', `'typeorm'`));
    }
    for (const handler of this.execOrder) {
      const templateHandler = await this.registry.getHandler(handler);
      const handlerOutPut = templateHandler.generate(entities, columns);

      handlerOutPut.forEach((codeString, entity) => {
        codeObject[entity] += codeString;
      });

      // imports
      const templateImports = await templateHandler.getImports();

      for (const entity of entities) {
        const entityImports =
          templateImports[entity.name] ?? templateImports.get(entity.name);

        if (entityImports) {
          if (!this.imports[entity.name]) {
            this.imports[entity.name] = new Set([...entityImports]);
          } else {
            let previousImport =
              this.imports[entity.name] ?? this.imports.get(entity.name);

            this.imports[entity.name] = new Set([
              ...entityImports,
              ...previousImport,
            ]);
          }
        }
      }
    }

    const importCode = await this.generateImports(entities, this.imports);

    for (const [entityName, value] of Object.entries(codeObject)) {
      let final = '';
      final += importCode[entityName] + this.generateClass(entityName) + value;

      codeObject[entityName] = final + '}';
    }

    return codeObject;
  }
}
