import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectItem } from './entities/project.entity';
import { Repository } from 'typeorm';
import { UUID } from 'crypto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectItem)
    private readonly projectRepository: Repository<ProjectItem>,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    console.log(createProjectDto);
    const project = new ProjectItem({ ...createProjectDto });
    return await this.projectRepository.save(project);
  }

  async findAll() {
    console.log('findAll');
    return await this.projectRepository.find({ relations: ['models'] });
  }

  async findOne(id: string) {
    console.log(id);
    return await this.projectRepository.findOne({
      where: { id },
      relations: ['models'],
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    return await this.projectRepository.update(id, updateProjectDto);
  }

  async remove(id: string) {
    const deleteResult = await this.projectRepository.delete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }
}
