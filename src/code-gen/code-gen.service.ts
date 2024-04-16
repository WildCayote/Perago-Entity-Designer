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
  imports: Set<ImportObject>;
  generate(entities: Model[], columns: Columns[]): Map<string, string>;
  addImport(dependency: ImportObject): void;
  getImports(): Set<ImportObject>;
}

class PrimaryColumnHandler implements TemplateHandler {
  imports = new Set<ImportObject>();

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
                new ImportObject('PrimaryGeneratedColumn', 'typeorm'),
              );
              break;
            case 'number':
              entityOutPut += this.incremetnTemplateFunction({ column });
              this.addImport(
                new ImportObject('PrimaryGeneratedColumn', 'typeorm'),
              );
              break;
          }
        }

        map.set(entity.name, entityOutPut);
      }
    }

    return map;
  }

  addImport(dependency: ImportObject): void {
    this.imports.add(dependency);
  }

  getImports(): Set<ImportObject> {
    return this.imports;
  }
}

class SimpleColumnHandler implements TemplateHandler {
  imports = new Set<ImportObject>();

  normalColTemplateFunction = handleBars.compile(
    `@Column({ name: '{{column.name}}', unique: {{column.isUnique}} })
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
          this.addImport(new ImportObject('Column', 'typeorm'));
        }
      }

      map.set(entity.name, entityOutPut);
    }

    return map;
  }

  addImport(dependency: ImportObject): void {
    this.imports.add(dependency);
  }

  getImports(): Set<ImportObject> {
    return this.imports;
  }
}

class RelationColumnHandler implements TemplateHandler {
  imports = new Set<ImportObject>();

  oneToOneFunction = handleBars.compile(
    `
    @Column({name : '{{column.name}}'})\n
{{column.name}} : {{column.type}}\n
@OneToOne((type) => {{referencedEntity}}, ({{ referencedEntity}}) => {{ referencedEntity}}.{{ currentEntity}})\n
@JoinColumn({name : '{{column.name}}' , eager : {{relation.eager}} , nullable : {{relation.nullable}}})
{{relation.joinName}}: {{referencedEntity}}
\n`,
  );
  onetToOneReverseFunction = handleBars.compile(
    `@OneToOne((type) => {{referencingEntity}} , ({{ referencingEntity}}) => {{ referencingEntity}}.{{referencedEntity}})
{{ referencingEntity}} : {{referencingEntity}}
\n`,
  );

  oneToManyFunction = handleBars.compile(``);
  oneTomanyReverseFunction = handleBars.compile('');

  manyToOneFunction = handleBars.compile(
    `@Column({ name: '{{column.name}}' })
{{column.name}}: {{column.type}};
\n@ManyToOne((type) => {{referencedEntity}}, ({{ referencedEntity}}) => {{ referencedEntity}}.{{ currentEntity }}s)
@JoinColumn({ name: '{{column.name}}', referencedColumnName: '{{referencedColumn}}' , eager : {{relation.eager}} , nullable : {{relation.nullable}} })
{{referencedEntity}}: {{referencedEntity}};
\n`,
  );
  manyToOneReverseFunction = handleBars.compile(
    `@OneToMany((type) => {{referencingEntity}},({{referencingEntity}}) => {{referencingEntity}}.{{referencedEntity}},{ eager: {{reference.eager}} },)
{{referencingEntity}}s : {{referencingEntity}}[];
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

          switch (column.relation.type) {
            case 'one-to-one':
              entityOutPut += this.oneToOneFunction({
                column: column,
                referencedEntity: referencedModel.name,
                relation: column.relation,
              });

              this.addImport(new ImportObject('OneToOne', 'typeorm'));

              this.addImport(
                new ImportObject(
                  referencedModel.name,
                  `./${referencedModel.name.toLocaleLowerCase()}.entity`,
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

              this.addImport(new ImportObject('ManyToOne', 'typeorm'));

              this.addImport(
                new ImportObject(
                  referencedModel.name,
                  `./${referencedModel.name.toLocaleLowerCase()}.entity`,
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

                this.addImport(new ImportObject('OneToOne', 'typeorm'));

                this.addImport(
                  new ImportObject(
                    referencedModel.name,
                    `./${referencedModel.name.toLocaleLowerCase()}.entity`,
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
                  new ImportObject(
                    referencedModel.name,
                    `./${referencedModel.name.toLocaleLowerCase()}.entity`,
                  ),
                );
                this.addImport(new ImportObject('OneToMany', 'typeorm'));

                break;
            }
          }
        }
      }

      map.set(entity.name, entityOutPut);
    }

    return map;
  }

  addImport(dependency: ImportObject): void {
    this.imports.add(dependency);
  }

  getImports(): Set<ImportObject> {
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
export class CodeGenService {
  private execOrder: string[];
  private imports: Set<ImportObject>;

  constructor(private readonly registry: TemplateHandlerRegistry) {
    this.registerDefualtHandlers();
    this.imports = new Set<ImportObject>([
      new ImportObject('Entity', 'typeorm'),
    ]);
  }

  private registerDefualtHandlers(): void {
    this.registry.registerHandler('columns', new SimpleColumnHandler());
    this.registry.registerHandler('relations', new RelationColumnHandler());
    this.registry.registerHandler('primaryCols', new PrimaryColumnHandler());

    this.execOrder = ['primaryCols', 'columns', 'relations'];
  }

  private generateImports() {
    const dependecyModuleMap: Record<string, any> = {};
    const importStatements = handleBars.compile(
      `import { {{#each items}}{{this}}{{#unless @last}}, {{/unless}}{{/each}} } from {{module}};\n
\n`,
    );

    for (const item of this.imports) {
      if (!dependecyModuleMap[item.dependency]) {
        dependecyModuleMap[item.dependency] = new Set<string>([item.module]);
      }
      dependecyModuleMap[item.dependency].add(item.module);
    }

    let result = '';
    for (const [key, value] of Object.entries(dependecyModuleMap)) {
      result += importStatements({ items: value, module: key });
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

  generateOutPut(entities: Model[], columns: Columns[]) {
    const codeObject: Record<string, any> = {};

    entities.forEach((entity) => {
      codeObject[entity.name] = '';
    });

    for (const handler of this.execOrder) {
      const templateHandler = this.registry.getHandler(handler);
      const handlerOutPut = templateHandler.generate(entities, columns);

      handlerOutPut.forEach((codeString, entity) => {
        codeObject[entity] += codeString;
      });

      // imports
      const templateImports = templateHandler.getImports();
      this.imports = new Set([...templateImports, ...this.imports]);
    }

    const importCode = this.generateImports();

    for (const [key, value] of Object.entries(codeObject)) {
      let final = '';
      final += importCode + this.generateClass(key) + value;

      codeObject[key] = final + '}';
    }

    return codeObject;
  }
}
