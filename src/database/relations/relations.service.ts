import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRelationDto } from './dto/create-relation.dto';
import { UpdateRelationDto } from './dto/update-relation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RelationItem } from './entities/relation.entity';
import { Column, In, Repository } from 'typeorm';
import { ColumnItem } from '../columns/entities/column.entity';

@Injectable()
export class RelationsService {
  constructor(
    @InjectRepository(RelationItem)
    private readonly relationRepository: Repository<RelationItem>,
    @InjectRepository(ColumnItem)
    private readonly columnRepository: Repository<ColumnItem>,
  ) {}

  async create(createRelationDto: CreateRelationDto) {
    const { columnId, referencedColumnId } = createRelationDto;

    // Find the column and referencedColumn
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });
    const referencedColumn = await this.columnRepository.findOne({
      where: { id: referencedColumnId },
    });

    // Ensure both columns exist
    if (!column || !referencedColumn) {
      const missingColumn = !column ? `Column with id ${columnId}` : null;
      const missingReferencedColumn = !referencedColumn
        ? `Referenced column with id ${referencedColumnId}`
        : null;
      const errorMessages = [missingColumn, missingReferencedColumn]
        .filter((msg) => !!msg)
        .join(' and ');
      throw new NotFoundException(`${errorMessages} not found`);
    }

    // Create a new relation item
    const relation = await this.relationRepository.create({
      ...createRelationDto,
      column,
      referencedColumn,
    });

    // Save the relation item
    return this.relationRepository.save(relation);
  }

  async findAll() {
    return await this.relationRepository.find();
  }

  async findOne(id: string) {
    return await this.relationRepository.findOne({ where: { id } });
  }

  async update(id: string, updateRelationDto: UpdateRelationDto) {
    return await this.relationRepository.update(id, updateRelationDto);
  }

  async remove(id: string) {
    return await this.relationRepository.delete(id);
  }
}
