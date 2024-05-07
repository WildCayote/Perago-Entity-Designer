import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
}
