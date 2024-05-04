import { Injectable, InternalServerErrorException } from '@nestjs/common';

import * as PgBoss from 'pg-boss';
import * as JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';

import { CodeGenService } from 'src/code-gen/code_gen.service';
import { BarrelGenService } from 'src/code-gen/services';

import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';

@Injectable()
export class PgBossService {
  private boss: PgBoss;
  constructor(
    private codeGenService: CodeGenService,
    private barrelGenService: BarrelGenService,
  ) {
    this.boss = new PgBoss(
      'postgres://postgres:believe%26achieve%40suchcringe@localhost:5433/PeragoEntityDB',
    );

    this.boss.start().catch((err) => {
      console.error('Error starting pg-boss:', err);
    });

    this.boss.work('processing_queue', this.compilingJob.bind(this));
    this.boss.work('cleaning_queue', this.cleaningJob.bind(this));
  }

  async addJob(entities: Model[], columns: Columns[]) {
    let jobId = await this.boss.send('processing_queue', {
      entities: entities,
      columns: columns,
    });

    return jobId;
  }

  async compilingJob(job) {
    try {
      const removeWaitTimeHourse = 48;
      console.log(`started working on job ${job.id}`);

      this.codeGenService
        .generateOutPut(job.data.entities, job.data.columns)
        .then(async (result) => {
          // cache the result (as a zip file) , preferrably a dedicated file server but for now on the current server
          await this.cacheZip(job.id, result);

          // add a job to remove the zip file after some defined time
          await this.boss.send(
            'cleaning_queue',
            { jobId: job.id },
            { startAfter: removeWaitTimeHourse * 60 * 60 },
          );

          // then notify the user to obtain it from the defined enpoint
          console.log(
            `Dear user I will send you a notification when your work is done. After that notification you will have 48 hours before I remove your proccessing result permanently !`,
          );
        })
        .catch((reason) => {
          throw reason;
        });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async cleaningJob(job) {
    try {
      const filePath = path.join(__dirname, `${job.data.jobId}.zip`);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          return;
        }
        console.log('File deleted successfully');
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async obtainResult(jobId: string) {
    try {
      let job = await this.boss.getJobById(jobId);
      switch (job.state) {
        case 'failed':
          throw new InternalServerErrorException(job.output);
      }

      // read the file and return the buffer
      const filePath = path.join(__dirname, `${jobId}.zip`);
      const buffer = fs.readFileSync(filePath);

      return buffer;
    } catch (error) {
      throw error;
    }
  }

  async cacheZip(jobId: string, input: Object) {
    try {
      // create zip file from the generated code
      const archive = new JSZip();

      for (const key of Object.keys(input)) {
        let value = '';
        let keysSet: Set<string> = new Set<string>([
          ...Object.keys(input[key]).concat([]),
        ]);

        let barrelData = '';

        switch (key) {
          case 'appModule':
            value = input[key];
            archive.file('src/app.module.ts', value);
            break;
          case 'main':
            value = input[key];
            archive.file('src/main.ts', value);
            break;
          case 'entityCode':
            barrelData = this.barrelGenService.getExports(keysSet, 'entity');
            for (const entity of Object.keys(input[key])) {
              value = input[key][entity];
              archive.file(
                `src/entities/${entity.toLowerCase()}.entity.ts`,
                value,
              );
            }
            archive.file(`src/entities/index.ts`, barrelData);
            break;
          case 'dtoCode':
            for (const entity of Object.keys(input[key])) {
              barrelData = this.barrelGenService.getExports(
                new Set<string>([entity]),
                'dto',
              );
              value = input[key][entity];
              archive.file(
                `src/${entity}/dtos/${entity.toLowerCase()}.dto.ts`,
                value,
              );
              archive.file(`src/${entity}/dtos/index.ts`, barrelData);
            }
            break;
          case 'controllerCode':
            for (const entity of Object.keys(input[key])) {
              barrelData = this.barrelGenService.getExports(
                new Set<string>([entity]),
                'controller',
              );
              value = input[key][entity];
              archive.file(
                `src/${entity}/controllers/${entity.toLowerCase()}.controller.ts`,
                value,
              );
              archive.file(`src/${entity}/controllers/index.ts`, barrelData);
            }
            break;
          case 'serviceCode':
            for (const entity of Object.keys(input[key])) {
              barrelData = this.barrelGenService.getExports(
                new Set<string>([entity]),
                'service',
              );
              value = input[key][entity];
              archive.file(
                `src/${entity}/services/${entity.toLowerCase()}.service.ts`,
                value,
              );
              archive.file(`src/${entity}/services/index.ts`, barrelData);
            }
            break;
          case 'moduleCode':
            for (const entity of Object.keys(input[key])) {
              barrelData = this.barrelGenService.getExports(
                new Set<string>([entity]),
                'module',
              );
              value = input[key][entity];
              archive.file(
                `src/${entity}/${entity.toLowerCase()}.module.ts`,
                value,
              );
            }
            break;
        }
      }

      // cache the zip file on the server
      const zipPath = path.join(__dirname, `${jobId}.zip`);
      const zipData = await archive.generateAsync({ type: 'nodebuffer' });

      console.log(`Base path : ${__dirname}`);
      console.log(`I stored the file here : ${zipPath}`);

      fs.writeFileSync(zipPath, zipData);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
