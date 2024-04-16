import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';
import {
  CreateColumnDto,
  CreateModelDto,
  UpdateColumnDto,
  UpdateModelDto,
} from './dto';
import { isInstance } from 'class-validator';
import { CreateRelationDto } from './dto/relation.dto';
import { RelationShip } from 'src/entities/relationship.entity';
import { CodeGenService } from 'src/code-gen/code-gen.service';

@Injectable()
export class ModelService {
  constructor(
    private codeGenServices: CodeGenService,

    @InjectRepository(Model)
    private modelRepositroy: Repository<Model>,

    @InjectRepository(Columns)
    private columnRepository: Repository<Columns>,

    @InjectRepository(RelationShip)
    private relationShipRepository: Repository<RelationShip>,
  ) {}

  async getModels() {
    const models = await this.modelRepositroy.find();
    return models;
  }

  async getModel(id: string) {
    try {
      const model = await this.modelRepositroy.findOne({ where: { id } });
      if (!model)
        throw new NotFoundException(
          "The model you were looking for doesn't exist!",
        );
      return model;
    } catch (error) {
      if (error.code == '22P02')
        throw new NotFoundException(
          "The model you were looking for doesn't exist!",
        );
      else if (isInstance(error, NotFoundException)) throw error;
    }
  }

  async extractModel(id: string) {
    try {
      // get all columns
      const columns = await this.columnRepository.find();

      // get all entities
      const entities = await this.modelRepositroy.find();
      const entity = await entities.find((item) => item.id == id);

      // pass them to the generator
      const codes = await this.codeGenServices.generateOutPut(
        entities,
        columns,
      );

      const code = codes[entity.name];
      const fileName = `${entity.name.toLowerCase()}.entity`;

      return { code, fileName };
    } catch (error) {
      console.log(error);
    }
  }

  async createModel(data: CreateModelDto) {
    try {
      const newModel = this.modelRepositroy.create(data);
      await this.modelRepositroy.save([newModel]);
      return newModel;
    } catch (error) {
      console.log(error);
    }
  }

  async updateModel(id: string, data: UpdateModelDto) {
    try {
      const response = await this.modelRepositroy.update({ id }, { ...data });
      return 'Model has been update';
    } catch (error) {
      console.log(error);
    }
  }

  async deleteModel(id: string) {
    try {
      const response = await this.modelRepositroy.delete({ id });
      return 'model successfuly deleted!';
    } catch (error) {
      console.log(error);
    }
  }

  async getColumns(modelId: string) {
    const columns = await this.columnRepository.find({
      where: { modelId },
    });
    return columns;
  }

  async getColumn(modelId: string, columnId: string) {
    try {
      const response = await this.columnRepository.findOne({
        where: { id: columnId, modelId: modelId },
      });

      if (!response)
        throw new NotFoundException(
          "The column you are looking for doesn't exist!",
        );

      return response;
    } catch (error) {
      if (error.code == '22P02')
        throw new NotFoundException(
          "The column you are looking for doesn't exist!",
        );
      console.log(error);
    }
  }

  async createColumn(modelId: string, data: CreateColumnDto) {
    try {
      if (data.isPrimary) {
        // find values with primary
        const withPrimary = await this.columnRepository.findOne({
          where: { isPrimary: true, modelId: modelId },
        });

        if (withPrimary != null)
          throw new ConflictException(
            `There is another column with the 'isPrimary' property set to true. The id is : ${withPrimary.id}`,
          );
      }

      if (data.isForiegn) {
        const relationData = data.relation;

        // check if the referencedColumn exists and if the types are the same
        const referencedColumn = await this.columnRepository.findOne({
          where: {
            id: relationData.referencedColumnId,
          },
        });

        if (!referencedColumn)
          throw new NotFoundException(
            "The column you are trying to reference doesn't exist!",
          );

        if (referencedColumn.type != data.type)
          throw new BadRequestException(
            'You are trying to create a relationship whose datatype is not compatable!',
          );
      }

      const newColumn = this.columnRepository.create({
        modelId: modelId,
        name: data.name,
        isForiegn: data.isForiegn,
        isPrimary: data.isPrimary,
        isUnique: data.isUnique,
        type: data.type,
      });

      await this.columnRepository.save(newColumn);

      const relation = await this.createRelation(newColumn.id, data.relation);

      newColumn.relation = relation;

      return newColumn;
    } catch (error) {
      if (error.code == '23503')
        throw new BadRequestException(
          "The model you want to create a column for doesn't exist",
        );
      else if (isInstance(error, ConflictException)) throw error;
      else if (isInstance(error, BadRequestException)) throw error;
    }
  }

  async updateColumn(modelId: string, columnId: string, data: UpdateColumnDto) {
    try {
      await this.getColumn(modelId, columnId);

      if (data.isPrimary) {
        // find values with primary
        const withPrimary = await this.columnRepository.findOne({
          where: { isPrimary: true, modelId: modelId },
        });

        if (withPrimary != null)
          throw new ConflictException(
            `There is another column with the 'isPrimary' property set to true. The id is : ${withPrimary.id}`,
          );
      }

      await this.columnRepository.update(
        { id: columnId },
        {
          name: data.name,
          isForiegn: data.isForiegn,
          isPrimary: data.isPrimary,
          isUnique: data.isUnique,
          type: data.type,
        },
      );

      return 'Update was succesfull!';
    } catch (error) {
      if (isInstance(error, NotFoundException)) throw error;
      else if (isInstance(error, ConflictException)) throw error;
    }
  }

  async deleteColumn(modelId: string, columnId: string) {
    try {
      const toBeDeleted = await this.getColumn(modelId, columnId);
      await this.columnRepository.delete({ id: columnId });

      return 'column successfuly deleted';
    } catch (error) {
      if (isInstance(error, NotFoundException))
        throw new NotFoundException(
          "The column you are looking for doesn't exist",
        );
    }
  }

  async createRelation(columnId: string, data: CreateRelationDto) {
    try {
      const newRelation = this.relationShipRepository.create({
        columnId: columnId,
        ...data,
      });

      await this.relationShipRepository.save(newRelation);
      return newRelation;
    } catch (error) {
      if (error.code === '23503')
        throw new BadRequestException(
          "The column you are trying to create a relation for doesn't exist!",
        );
    }
  }

  async getRelation(id: string) {
    return await this.relationShipRepository.findOne({ where: { id } });
  }
}
