import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isInstance } from 'class-validator';
import { Repository } from 'typeorm';

import { Project } from 'src/entities/project.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
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
      return 'Project successfuly deleted!';
    } catch (error) {
      console.log(error);
    }
  }
}
