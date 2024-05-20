import { Injectable } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ColumnItem } from './entities/column.entity';
import { In, Repository } from 'typeorm';
import { ModelItem } from '../model/entities/model.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(ColumnItem)
    private readonly columnRepository: Repository<ColumnItem>,
    @InjectRepository(ModelItem)
    private readonly modelRepository: Repository<ModelItem>,
  ) {}

  async create(createColumnDto: CreateColumnDto) {
    const {
      name,
      type,
      isForeignKey,
      isPrimaryKey,
      isUnique,
      isNullable,
      modelId,
    } = createColumnDto;
    const table = await this.modelRepository.findOne({
      where: { id: modelId },
    });
    if (!table) {
      throw new Error('Model not found');
    }
    // Create and save the column
    const column = new ColumnItem({
      name,
      type,
      isForeignKey,
      isPrimaryKey,
      isUnique,
      isNullable,
      table,
    });
    return await this.columnRepository.save(column);
  }

  async findAll() {
    return await this.columnRepository.find();
  }

  async findOne(id: string) {
    return await this.columnRepository.findOne({ where: { id } });
  }

  async update(id: string, updateColumnDto: UpdateColumnDto) {
    console.log(updateColumnDto);
    return await this.columnRepository.update(id, updateColumnDto);
  }

  async remove(id: string) {
    return await this.columnRepository.delete(id);
  }
}
