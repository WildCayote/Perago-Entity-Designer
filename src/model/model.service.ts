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
  CreateProjectDto,
  UpdateProjectDto,
  CreateColumnDto,
  CreateModelDto,
  UpdateColumnDto,
  UpdateModelDto,
} from './dto';
import { isInstance } from 'class-validator';
import { CreateRelationDto } from './dto/relation.dto';
import { RelationShip } from 'src/entities/relationship.entity';
import { CodeGenService } from 'src/code-gen/code-gen.service';
import { Project } from 'src/entities/project.entity';

@Injectable()
export class ModelService {
  constructor(
    private codeGenServices: CodeGenService,

    @InjectRepository(Project)
    private projectRepository: Repository<Project>,

    @InjectRepository(Model)
    private modelRepositroy: Repository<Model>,

    @InjectRepository(Columns)
    private columnRepository: Repository<Columns>,

    @InjectRepository(RelationShip)
    private relationShipRepository: Repository<RelationShip>,
  ) {}

  async getProjects() {
    const projects = await this.projectRepository.find();
    return projects;
  }

  async getProject(id: string) {
    try {
      const project = await this.projectRepository.findOne({ where: { id } });
      if (!project)
        throw new NotFoundException(
          "The project you were looking for doesn't exist!",
        );
      return project;
    } catch (error) {
      if (error.code == '22P02')
        throw new NotFoundException(
          "The project you were looking for doesn't exist!",
        );
      else if (isInstance(error, NotFoundException)) throw error;
    }
  }

  async createProject(data: CreateProjectDto) {
    try {
      const newProject = this.projectRepository.create(data);
      await this.projectRepository.save([newProject]);
      return newProject;
    } catch (error) {
      console.log(error);
    }
  }

  async updateProject(id: string, data: UpdateProjectDto) {
    try {
      await this.projectRepository.update({ id }, { ...data });
      return 'Project has been update';
    } catch (error) {
      console.log(error);
    }
  }

  async deleteProject(id: string) {
    try {
      const response = await this.projectRepository.delete({ id });
      console.log(response);
      return 'Project successfuly deleted!';
    } catch (error) {
      console.log(error);
    }
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

  async extractModel(projectId: string) {
    try {
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

      // pass them to the generator
      const codes = await this.codeGenServices.generateOutPut(
        entities,
        columns,
      );

      return codes;
    } catch (error) {
      console.log(error);
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

  async getColumns(projectId: string, modelId: string) {
    try {
      // check to see if the model exists
      await this.getModel(projectId, modelId);

      const columns = await this.columnRepository.find({
        where: { modelId },
      });

      return columns;
    } catch (error) {
      if (isInstance(error, NotFoundException)) throw error;
    }
  }

  async getColumn(projectId: string, modelId: string, columnId: string) {
    try {
      // check if the model exists
      await this.getModel(projectId, modelId);

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
      if (isInstance(error, NotFoundException)) throw error;
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
      else if (error.code == '23505')
        throw new ConflictException(
          'A column with the same name already exists!',
        );
    }
  }

  async updateColumn(
    projectId: string,
    modelId: string,
    columnId: string,
    data: UpdateColumnDto,
  ) {
    try {
      await this.getColumn(projectId, modelId, columnId);

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

  async deleteColumn(projectId: string, modelId: string, columnId: string) {
    try {
      const toBeDeleted = await this.getColumn(projectId, modelId, columnId);
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
