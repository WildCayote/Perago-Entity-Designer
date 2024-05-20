import { Body, Controller, Get, Param, Res } from '@nestjs/common';
import { FileIoService } from './file-io.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('file')
export class FileIoController {
  constructor(private readonly fileIoService: FileIoService) {}

  @Get('project/:projectId')
  async downloadProject(
    @Param('projectId') projectId: string,
    @Body() pattern: String,
    @Res() res: Response,
  ) {
    try {
      // Generate the zip file
    const project = await this.fileIoService.getProject(projectId, pattern == FileStructre.layered ? "layered": "default");
      const zipFilePath = project.path;

      // Send the zip file
      res.download(zipFilePath, 'src.zip', (err) => {
        if (err) {
          console.log('Error sending zip file: ', err);
          res.status(500).send('Error sending zip file');
        } else {
          // fs.unlinkSync(zipFilePath);
        }
      });
    } catch (error) {
      console.log('Error downloading project: ', error);
      res.status(500).send('Error downloading project');
    }
  }
}


enum FileStructre {
  default = "default",
  layered = "layered",
}