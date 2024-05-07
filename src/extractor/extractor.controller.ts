import { Controller, Get, Param, Res } from '@nestjs/common';
import { ExtractorService } from './extractor.service';
import { Response } from 'express';

@Controller({ path: 'extractor', version: '1' })
export class ExtractorController {
  constructor(private extractionService: ExtractorService) {}

  @Get(':projectId/extract')
  async extractProject(@Param('projectId') projectId: string) {
    const codeResponse = await this.extractionService.extractModel(projectId);

    return {
      ...codeResponse,
      message:
        'Open a web socket connection and listen to an event with the job ID sent in this response',
    };
  }

  @Get(':jobId/obtain')
  async obtainProject(@Param('jobId') jobId: string, @Res() res: Response) {
    const buffer = await this.extractionService.obtainResult(jobId);

    res.setHeader('Content-Disposition', 'attachment; filename="src.zip"');
    res.setHeader('Content-Type', 'application/zip');

    res.send(buffer);
  }
}
