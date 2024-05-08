import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Model } from 'src/entities/model.entity';

import { CreateModelDto, UpdateModelDto } from './dto';
import { isInstance } from 'class-validator';

@Injectable()
export class ModelService {
  constructor(
    @InjectRepository(Model)
    private modelRepositroy: Repository<Model>,
  ) {}

  async findAll() {
    return await this.modelRepositroy.find({
      relations: ['project', 'columns'],
    });
  }

  async getModels(projectId: string) {
    const models = await this.modelRepositroy.find({ where: { projectId } });
    return models;
  }

  async getModel(projectId: string, id: string) {
    try {
      const model = await this.modelRepositroy.findOne({
        where: { id: id, projectId: projectId },
      });
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

  async createModel(projectId: string, data: CreateModelDto) {
    try {
      const newModel = this.modelRepositroy.create({
        projectId: projectId,
        ...data,
      });
      await this.modelRepositroy.save([newModel]);
      return newModel;
    } catch (error) {
      console.log(error);
    }
  }

  async updateModel(projectId: string, id: string, data: UpdateModelDto) {
    try {
      const response = await this.modelRepositroy.update(
        { id: id, projectId: projectId },
        { ...data },
      );
      return 'Model has been updated!';
    } catch (error) {
      console.log(error);
    }
  }

  async deleteModel(projectId: string, id: string) {
    try {
      const response = await this.modelRepositroy.delete({
        id: id,
        projectId: projectId,
      });
      return 'Model successfuly deleted!';
    } catch (error) {
      console.log(error);
    }
  }
}
