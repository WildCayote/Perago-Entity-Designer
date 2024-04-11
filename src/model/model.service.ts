import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';
import { CreateModelDto, UpdateModelDto } from './dto';
import { isInstance } from 'class-validator';

@Injectable()
export class ModelService {
  constructor(
    @InjectRepository(Model)
    private modelRepositroy: Repository<Model>,

    @InjectRepository(Columns)
    private columnRepository: Repository<Columns>,
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
    const columns = await this.columnRepository.find({ where: { modelId } });
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
    } catch (error) {
      if (error.code == '22P02')
        throw new NotFoundException(
          "The column you are looking for doesn't exist!",
        );
    }
  }

  async createColumn(modelId: string, data: CreateModelDto) {
    try {
      const newColumn = this.columnRepository.create({
        modelId: modelId,
        ...data,
      });

      await this.columnRepository.save(newColumn);

      return newColumn;
    } catch (error) {
      console.log(error);
    }
  }

  async updateColumn(modelId: string, columnId: string, data: UpdateModelDto) {
    try {
      const toBeUpdated = await this.getColumn(modelId, columnId);

      const response = await this.columnRepository.update(
        { id: columnId },
        { ...data },
      );

      return 'Update was succesfull!';
    } catch (error) {
      if (isInstance(error, NotFoundException))
        throw new NotFoundException(
          "The column you are looking for doesn't exist",
        );
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
}
