import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';
import { Project } from 'src/entities/project.entity';
import { PgBossService } from 'src/pg-boss/pg-boss.service';
import { Repository } from 'typeorm';

@Injectable()
export class ExtractorService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,

    @InjectRepository(Columns)
    private columnRepository: Repository<Columns>,

    @InjectRepository(Model)
    private modelRepositroy: Repository<Model>,

    private pgBossService: PgBossService,
  ) {}

  async extractModel(projectId: string) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
      });

      if (!project) {
        throw new NotFoundException(`Project with id ${projectId} not found`);
      } else {
        const pgResponse = await this.pgBossService.addJob(projectId);

        console.log(`Job Id recieved : ${pgResponse}`);

        return { jobId: pgResponse };
      }
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
}
