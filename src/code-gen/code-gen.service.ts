import { Injectable } from '@nestjs/common';

import * as JSZip from 'jszip';

import {
  BootstrapService,
  ControllersService,
  DtosService,
  EntitiesService,
  ModulesService,
  ServicesService,
} from './services';

@Injectable()
export class CodeGenService {
  constructor(
    private readonly entitiesService: EntitiesService,
    private readonly dtosService: DtosService,
    private readonly controllersService: ControllersService,
    private readonly servicesService: ServicesService,
    private readonly modulesService: ModulesService,
    private readonly bootstrapService: BootstrapService,
  ) {}

  async getProject(id: string) {
    const [entites, projectData] =
      await this.entitiesService.generateAllEntities(id);
    const entityNamesList = Object.keys(entites).slice(1);

    const dtos = await this.dtosService.generateAllDTOsByProject(
      entites['projectModels'],
    );
    const controllers =
      this.controllersService.generateControllers(entityNamesList);
    const services = this.servicesService.generateServices(entityNamesList);
    const modules = this.modulesService.generateModules(entityNamesList);
    const appModule = this.bootstrapService.generateAppModule(entityNamesList);
    const bootstrap = this.bootstrapService.getMainBootstrap();
    const packageJson = this.bootstrapService.generatePackageJson(
      projectData.projectName,
      projectData.projectDescription,
    );
    const tsconfig = this.bootstrapService.generateTsConfig();

    const project_name = projectData.projectName.toLowerCase();

    // Create a new zip file
    const zip = new JSZip();

    // Add files to the zip
    // for entities
    for (const [key, value] of Object.entries(entites)) {
      if (key === 'projectModels') {
        continue;
      }
      zip.file(
        `${project_name}/src/entities/${key}.entity.ts`,
        value as string,
      );
    }
    // for dtos
    for (const [key, value] of Object.entries(dtos)) {
      zip.file(`${project_name}/src/dtos/${key}.dto.ts`, value as string);
    }
    // for controllers
    for (const [key, value] of Object.entries(controllers)) {
      zip.file(
        `${project_name}/src/${key}/controllers/${key}.controller.ts`,
        value as string,
      );
    }
    // for services
    for (const [key, value] of Object.entries(services)) {
      zip.file(
        `${project_name}/src/${key}/services/${key}.service.ts`,
        value as string,
      );
    }
    // for modules
    for (const [key, value] of Object.entries(modules)) {
      zip.file(`${project_name}/src/${key}/${key}.module.ts`, value as string);
    }
    // for bootstrap
    zip.file(`${project_name}/src/app.module.ts`, appModule as string);
    zip.file(`${project_name}/src/main.ts`, bootstrap as string);
    zip.file(`${project_name}/package.json`, packageJson as string);
    zip.file(`${project_name}/tsconfig.json`, tsconfig as string);

    // Generate zip content
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    return zipContent;
  }

  toKebabCase(text: string): string {
    let kebabCaseText = text.replace(/\s+/g, '-');

    kebabCaseText = kebabCaseText.toLowerCase();
    return kebabCaseText;
  }
}
