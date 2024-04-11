import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Column } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';
import { CreateModelDto, UpdateModelDto } from './dto';

@Injectable()
export class ModelService {
  constructor(
    @InjectRepository(Model)
    private modelRepositroy: Repository<Model>,

    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
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
}
