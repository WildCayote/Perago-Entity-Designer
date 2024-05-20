import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ColumnItem as Columns } from 'src/database/columns/entities/column.entity';
import { ModelItem as Model } from 'src/database/model/entities/model.entity';
import { ProjectItem as Project } from 'src/database/project/entities/project.entity';

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
      console.log("project: ",project);
      const pgResponse = await this.pgBossService.addJob(projectId);

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
}
