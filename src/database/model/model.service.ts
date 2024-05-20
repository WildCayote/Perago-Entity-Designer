import { Injectable } from '@nestjs/common';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { Repository } from 'typeorm';
import { ModelItem } from './entities/model.entity';
import { ProjectItem } from '../project/entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ModelService {
  constructor(
    @InjectRepository(ModelItem)
    private readonly modelRepository: Repository<ModelItem>,
    @InjectRepository(ProjectItem)
    private readonly projectRepository: Repository<ProjectItem>,
  ) {}

  async create(createModelDto: CreateModelDto) {
    const { modelName, description, projectId } = createModelDto;
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new Error('Project not found');
    }
    // Create and save the model
    const model = this.modelRepository.create({
      modelName,
      description,
      project,
    });
    return this.modelRepository.save(model);
  }

  async findAll() {
    return await this.modelRepository.find({
      relations: ['project', 'columns'],
    });
  }

  async findOne(id: string) {
    return await this.modelRepository.findOne({
      where: { id },
      relations: ['project', 'columns'],
    });
  }

  async update(id: string, updateModelDto: UpdateModelDto) {
    return await this.modelRepository.update(id, updateModelDto);
  }

  async remove(id: string) {
    return await this.modelRepository.delete(id);
  }
}
