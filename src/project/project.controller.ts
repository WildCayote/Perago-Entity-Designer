import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { ProjectService } from './project.service';

@Controller({ path: 'projects', version: '1' })
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Get()
  getProjects() {
    return this.projectService.getProjects();
  }

  @Post()
  createProject(@Body() model: CreateProjectDto) {
    return this.projectService.createProject(model);
  }

  @Patch(':id')
  updateProject(
    @Param('id') projectId: string,
    @Body() model: UpdateProjectDto,
  ) {
    return this.projectService.updateProject(projectId, model);
  }

  @Delete(':id')
  deleteProject(@Param('id') projectId: string) {
    return this.projectService.deleteProject(projectId);
  }
}
