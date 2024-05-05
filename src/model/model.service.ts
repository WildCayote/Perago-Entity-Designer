import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';

import { CreateModelDto, UpdateModelDto } from './dto';
import { isInstance } from 'class-validator';

import { RelationShip } from 'src/entities/relationship.entity';
import { CodeGenService } from 'src/code-gen/code_gen.service';
import { Project } from 'src/entities/project.entity';

import { BarrelGenService } from 'src/code-gen/services';
import { PgBossService } from 'src/pg-boss/pg-boss.service';

@Injectable()
export class ModelService {
  constructor(
    private pgBossService: PgBossService,

    @InjectRepository(Project)
    private projectRepository: Repository<Project>,

    @InjectRepository(Model)
    private modelRepositroy: Repository<Model>,

    @InjectRepository(Columns)
    private columnRepository: Repository<Columns>,
  ) {}

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

  async extractModel(projectId: string) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
      });

      // get all columns
      const allColumns = await this.columnRepository.find();

      // get all entities of the project
      const entities = await this.modelRepositroy.find({
        where: { projectId: projectId },
      });

      const entityIds = entities.map((entity) => entity.id);

      // filter columns that belong to the proper entities, i.e entities that belong to the project
      const columns = allColumns.filter((column) =>
        entityIds.includes(column.modelId),
      );

      //testing pg-boss
      const pgResponse = await this.pgBossService.addJob(entities, columns);

      console.log(`Job Id recieved : ${pgResponse}`);

      return { jobId: pgResponse };
    } catch (error) {
      console.log(error);
    }
  }

  async obtainResult(jobId: string) {
    try {
      const result = await this.pgBossService.obtainResult(jobId);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
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
