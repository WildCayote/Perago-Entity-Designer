import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isInstance } from 'class-validator';
import { Columns } from 'src/entities/column.entity';
import { Repository } from 'typeorm';
import { CreateColumnDto, UpdateColumnDto } from './dto/column.dto';
import { CreateRelationDto } from './dto/relation.dto';
import { RelationShip } from 'src/entities/relationship.entity';

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(Columns) private columnRepository: Repository<Columns>,
    @InjectRepository(RelationShip)
    private relationShipRepository: Repository<RelationShip>,
  ) {}

  async getColumns(modelId: string) {
    try {
      const columns = await this.columnRepository.find({
        where: { modelId },
      });

      return columns;
    } catch (error) {
      if (isInstance(error, NotFoundException)) throw error;
    }
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

  async updateColumn(modelId: string, columnId: string, data: UpdateColumnDto) {
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
