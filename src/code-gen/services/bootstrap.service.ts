import { Injectable } from '@nestjs/common';
import { HandlebarsService } from './handlebars.service';
import * as fs from 'fs';

@Injectable()
export class BootstrapService {
  private readonly appModuleTemplate: string;
  private readonly mainBootstrapTemplate: string;
  private readonly packageJsonTemplate: string;
  private readonly tsConfigTemplate: string;

  constructor(private readonly handlebarsService: HandlebarsService) {
    this.appModuleTemplate = fs.readFileSync(
      'src/code-gen/templates/app-module-template.hbs',
      'utf-8',
    );
    this.mainBootstrapTemplate = fs.readFileSync(
      'src/code-gen/templates/main-template.txt',
      'utf-8',
    );
    this.packageJsonTemplate = fs.readFileSync(
      'src/code-gen/templates/package-json-template.hbs',
      'utf-8',
    );
    this.tsConfigTemplate = fs.readFileSync(
      'src/code-gen/templates/tsconfig-template.hbs',
      'utf-8',
    );
  }

  generateAppModule(entities: string[]) {
    const data = {
      Entities: entities,
    };
    const template = this.handlebarsService.compileTemplate(
      this.appModuleTemplate,
      data,
    );
    return template;
  }

  getMainBootstrap() {
    return this.mainBootstrapTemplate;
  }

  generatePackageJson(projectName: string, projectDescription: string) {
    const data = {
      projectName,
      projectDescription,
    };
    const packageJson = this.handlebarsService.compileTemplate(
      this.packageJsonTemplate,
      data,
    );
    return packageJson;
  }

  generateTsConfig() {
    return this.tsConfigTemplate;
  }
}