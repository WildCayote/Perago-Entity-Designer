import { Injectable, InternalServerErrorException } from '@nestjs/common';

import * as PgBoss from 'pg-boss';
import * as fs from 'fs';
import { promisify } from 'util';

import { CodeGenService } from 'src/code-gen/code-gen.service';
import { PgBossGateway } from './pg-boss.gateway';

@Injectable()
export class PgBossService {
  private boss: PgBoss;
  constructor(
    private codeGenService: CodeGenService,
    // private barrelGenService: BarrelGenService,
    private pgBossGateway: PgBossGateway,
  ) {
    this.boss = new PgBoss('postgres://postgres:dawit@localhost:5433/code_gen');
  }

  onModuleInit() {
    try {
      this.boss.start().catch((err) => {
        this.handlePgBossError(err);
      });

      this.boss.work('processing_queue', this.compilingJob.bind(this));
      this.boss.work('cleaning_queue', this.cleaningJob.bind(this));
    } catch (error) {
      this.handlePgBossError(error);
    }
  }

  async addJob(projectId: string) {
    let jobId = await this.boss.send(
      'processing_queue',
      {
        projectId: projectId,
      },
      {
        startAfter: 10,
      },
    );

    return jobId;
  }

  async compilingJob(job) {
    try {
      const removeWaitTimeHourse = 48;
      console.log(`started working on job ${job.id}`);

      this.codeGenService
        .getProject(job.data.projectId)
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
          this.pgBossGateway.wss.emit(
            job.id,
            'The code compilation process has been finished you can now download the code. The output will be removed from the server after 48 hours starting now',
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
      const filePath = `src/pg-boss/output/${job.data.jobId}.zip`;
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
      const filePath = `src/pg-boss/output/${jobId}.zip`;
      const buffer = fs.readFileSync(filePath);

      return buffer;
    } catch (error) {
      throw error;
    }
  }

  async cacheZip(jobId: string, buffer: Buffer) {
    try {
      const zipPath = `src/pg-boss/output/${jobId}.zip`;
      const writeFileAsync = promisify(fs.writeFile);
      await writeFileAsync(zipPath, buffer);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private handlePgBossError(error: any) {
    if (error.code === '42701') {
      console.error(
        'The column already exists in table. Skipping migration step.',
      );
    } else {
      console.error('Error starting pg-boss:', error);
      throw error; // Re-throw the error
    }
  }
}
