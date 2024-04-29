import { Injectable, InternalServerErrorException } from '@nestjs/common';

import * as handleBars from 'handlebars';

import { Model } from 'src/entities/model.entity';
import { Columns } from 'src/entities/column.entity';

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
    public foreignType: string,
  ) {}

  equals(otherInstance: ReferenceObject) {
    return (
      this.entityName == otherInstance.entityName &&
      this.referenceName == otherInstance.referenceName &&
      this.primaryColumn == otherInstance.primaryColumn &&
      this.foreignColumn == otherInstance.foreignColumn &&
      this.foreignType == otherInstance.foreignType
    );
  }
}

Injectable();
export class ServGenService {
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
  ) {
    const simpleGetAllHandler = handleBars.compile(
      `async getAll(){ return await this.{{entityName}}Repository.find(); }\n\n`,
    );
    const complexGetAllHandler = handleBars.compile(
      `async getAll() { 
        try{
            const result = await this.{{entityName}}.find({where : { {{foreignColumn}} : {{foreignColumn}} } });
            return result;
        }catch(error){

        }
        }\n\n`,
    );

    const complexGetHandler = handleBars.compile(
      `async getOne( {{foreignColumn}} : {{foreignType}} , {{primaryCol}} : {{coltype}}) {
        try{
            const result = await this.{{entityName}}Repository.findOne({where : { {{foreignColumn}} : {{foreignColumn}} , {{primaryCol}} : {{primaryCol}} }});
            return result;
        }catch(error){

        }
      }\n\n`,
    );
    const simpleGetHandler = handleBars.compile(
      `async getOne({{primaryCol}} : {{coltype}}) {
        try{
            const result = await this.{{entityName}}Repository.findOne({where : { {{primaryCol}} : {{primaryCol}} }});
            return result;
        }catch(error){

        }
      }\n\n`,
    );

    let result = new Map<string, string>();

    for (const [key, value] of primaryCols.entries()) {
      let currentRelation = relations.get(key);
      let currentPrimary = value;

      result.set(key, '');

      if (currentRelation.size) {
        for (let relation of currentRelation.values()) {
          let primaryName = '';
          let coltype = '';
          for (let col of currentPrimary.values()) {
            primaryName = col.name;
            coltype = col.type;
          }

          let getAllCode = complexGetAllHandler({
            primaryCol: primaryName,
            coltype: coltype,
            foreignType: relation.foreignType,
            foreignColumn: relation.foreignColumn,
            entityName: relation.entityName,
          });
          let getCode = complexGetHandler({
            primaryCol: primaryName,
            coltype: coltype,
            entityName: relation.entityName,
            foreignType: relation.foreignType,
            foreignColumn: relation.foreignColumn,
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

  private handleCreate(
    relations: Map<string, Set<ReferenceObject>>,
    primaryCols: Map<string, Set<Columns>>,
  ) {
    const simplePostHandler = handleBars.compile(
      `async create(data : {{entityName}}CreateDto ){
        try{
            const newInstance = this.{{entityName}}Repository.create(data);
            await this.{{entityName}}Repository.save([newInstance]);
            return newInstance;
        }catch(error){

        }
      }\n\n`,
    );
    const complexPostHandler =
      handleBars.compile(`async create({{foreignColumn}} : {{foreignType}} , data : {{entityName}}CreateDto ){
        try{
            const newInstance = this.{{entityName}}Repository.create({ {{foreignColumn}} , ...data});
            await this.{{entityName}}Repository.save([newInstance]);
            return newInstance;
        }catch(error){

        }
      }\n\n`);

    let result = new Map<string, string>();

    for (const [key, value] of primaryCols.entries()) {
      let currentRelation = relations.get(key);
      let currentPrimary = value;

      result.set(key, '');

      if (currentRelation.size) {
        for (let relation of currentRelation.values()) {
          let postCode = complexPostHandler({
            referenceName: relation.referenceName,
            foreignColumn: relation.foreignColumn,
            foreignType: relation.foreignType,
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

  private handleDelete(
    relations: Map<string, Set<ReferenceObject>>,
    primaryCols: Map<string, Set<Columns>>,
  ) {
    const simpleDeleteHandler =
      handleBars.compile(`async delete({{primaryColumn}}: {{primaryType}}) {
        try {
          const response = await this.{{entityName}}Repository.delete({ {{primaryColumn}} });
          return '{{entityName}} successfuly deleted!';
        } catch (error) {
        }
      }`);
    const complexDeleteHandler =
      handleBars.compile(`async delete({{foreignColumn}} : {{foreignType}}, {{primaryColumn}}: {{primaryType}}) {
        try {
          const response = await this.{{entityName}}Repository.delete({ {{foreignColumn}}, {{primaryColumn}} });
          return '{{entityName}} successfuly deleted!';
        } catch (error) {
        }
      }`);

    let result = new Map<string, string>();

    for (const [key, value] of primaryCols.entries()) {
      let currentRelation = relations.get(key);
      let currentPrimary = value;

      result.set(key, '');

      if (currentRelation.size) {
        for (let relation of currentRelation.values()) {
          let primaryType = '';
          for (let col of currentPrimary.values()) {
            primaryType = col.type;
          }

          let deleteCode = complexDeleteHandler({
            foreignColumn: relation.foreignColumn,
            foreignType: relation.foreignType,
            entityName: relation.entityName,
            primaryColumn: relation.primaryColumn,
            primaryType: primaryType,
          });

          let oldCode = result.get(key);
          oldCode += deleteCode;
          result.set(key, oldCode);
        }
      } else if (currentPrimary.size) {
        let primaryName = '';
        let primaryType = '';
        for (let col of currentPrimary.values()) {
          primaryName = col.name;
          primaryType = col.type;
        }
        let deleteCode = simpleDeleteHandler({
          entityName: key,
          primaryColumn: primaryName,
          primaryType: primaryType,
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

  private handleUpdate(
    relations: Map<string, Set<ReferenceObject>>,
    primaryCols: Map<string, Set<Columns>>,
  ) {
    const simplePatchHandler =
      handleBars.compile(`async update({{primaryColumn}}: {{primaryType}}, data: {{entityName}}UpdateDto) {
        try {
          await this.{{entityName}}Repository.update({ {{primaryColumn}} }, { ...data });
          return '{{entityName}} has been update';
        } catch (error) {}
      }`);
    const complexPatchHandler =
      handleBars.compile(`async update({{foreignColumn}} : {{foreignType}}, {{primaryColumn}}: {{primaryType}}, data: {{entityName}}UpdateDto) {
        try {
          await this.{{entityName}}Repository.update({ {{foreignColumn}}, {{primaryColumn}} }, { ...data });
          return '{{entityName}} has been update';
        } catch (error) {}
      }`);

    let result = new Map<string, string>();

    for (const [key, value] of primaryCols.entries()) {
      let currentRelation = relations.get(key);
      let currentPrimary = value;

      result.set(key, '');

      if (currentRelation.size) {
        for (let relation of currentRelation.values()) {
          let primaryType = '';
          for (let col of currentPrimary.values()) {
            primaryType = col.type;
          }

          let patchCode = complexPatchHandler({
            entityName: relation.entityName,
            foreignColumn: relation.foreignColumn,
            foreignType: relation.foreignType,
            primaryColumn: relation.primaryColumn,
            primaryType: primaryType,
          });

          let oldCode = result.get(key);
          oldCode += patchCode;
          result.set(key, oldCode);
        }
      } else if (currentPrimary.size) {
        let primaryName = '';
        let primaryType = '';
        for (let col of currentPrimary.values()) {
          primaryName = col.name;
          primaryType = col.type;
        }
        let patchCode = simplePatchHandler({
          entityName: key,
          primaryColumn: primaryName,
          primaryType: primaryType,
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
          new ImportObject('Injectable', "'@nestjs/common'"),
          new ImportObject(`InjectRepository`, "'@nestjs/typeorm'"),
          new ImportObject(`${entityName}`, "'src/entities'"),
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
                column.type,
              ),
            );
        } else if (columnModelId == entityId && column.isPrimary) {
          primaryCols.get(entityName).add(column);
        }
      }
    }

    const getCode = this.handleGet(relations, primaryCols);
    const createCode = this.handleCreate(relations, primaryCols);
    const deleteCode = this.handleDelete(relations, primaryCols);
    const updateCode = this.handleUpdate(relations, primaryCols);
  }
}
