import { Injectable } from '@nestjs/common';
import {
  ControllersService,
  DtosService,
  EntitiesService,
  ModulesService,
  ServicesService,
  BootstrapService,
} from './services';
import * as JSZip from 'jszip';
import * as fs from 'fs';
import { promisify } from 'util';
import jsConvert from 'js-convert-case';

const writeFileAsync = promisify(fs.writeFile);

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

  async getProject(id: string, pattern: string = 'default') {
    // console.log('pattern: ', pattern);
    const [entites, projectData] =
      await this.entitiesService.generateAllEntities(id);

    const entityNamesList = Object.keys(entites).slice(1);

    const dtos = await this.dtosService.generateAllDTOsByProject(
      entites['projectModels'],
    );
    const controllers = this.controllersService.generateControllers(
      entityNamesList,
      pattern,
    );
    const services = this.servicesService.generateServices(
      entityNamesList,
      pattern,
    );
    const modules = this.modulesService.generateModules(
      entityNamesList,
      pattern,
    );
    const appModule = this.bootstrapService.generateAppModule(
      entityNamesList,
      pattern,
    );
    const bootstrap = this.bootstrapService.getMainBootstrap();
    const packageJson = this.bootstrapService.generatePackageJson(
      projectData.projectName,
      projectData.projectDescription,
    );
    const tsconfig = this.bootstrapService.generateTsConfig();

    // barrell code
    const controllersBarrel =
      this.controllersService.generateBarrel(entityNamesList);
    const dtosBarrel = this.dtosService.generateBarrel(entityNamesList);
    const servicesBarrel = this.servicesService.generateBarrel(entityNamesList);
    const entityBarrel = this.entitiesService.generateBarrel(entityNamesList);
    const moduleBarrel = this.modulesService.generateBarrel(entityNamesList);

    const project = {
      ...projectData,
      entities: entites,
      dtos: dtos,
      controllers: controllers,
      services: services,
      modules: modules,
    };
    const project_name = this.toKebabCase(
      // projectData.projectName.toLowerCase(),
      projectData.projectName,
    );

    // console.log('project: ', project);

    // Create a new zip file
    const zip = new JSZip();

    // Add files to the zip
    // for entities
    for (const [key, value] of Object.entries(entites)) {
      if (key === 'projectModels') {
        continue;
      }
      zip.file(
        `${project_name}/src/entities/${this.toKebabCase(key)}.entity.ts`,
        value as string,
      );
    }
    zip.file(`${project_name}/src/entities/index.ts`, entityBarrel);

    // for dtos
    for (const [key, value] of Object.entries(dtos)) {
      zip.file(
        `${project_name}/src/dtos/${this.toKebabCase(key)}.dto.ts`,
        value as string,
      );
    }
    zip.file(`${project_name}/src/dtos/index.ts`, dtosBarrel);

    // for controllers
    for (const [key, value] of Object.entries(controllers)) {
      zip.file(
        `${project_name}/src/modules/${this.toKebabCase(key)}/controllers/${this.toKebabCase(key)}.controller.ts`,
        value as string,
      );
      zip.file(
        `${project_name}/src/modules/${this.toKebabCase(key)}/controllers/index.ts`,
        this.controllersService.generateBarrel([key]),
      );
    }
    // zip.file(`${project_name}/src/controllers/index.ts`, controllersBarrel);

    // for services
    for (const [key, value] of Object.entries(services)) {
      zip.file(
        `${project_name}/src/modules/${this.toKebabCase(key)}/services/${this.toKebabCase(key)}.service.ts`,
        value as string,
      );
      zip.file(
        `${project_name}/src/modules/${this.toKebabCase(key)}/services/index.ts`,
        this.servicesService.generateBarrel([this.toKebabCase(key)]),
      );
    }
    // zip.file(`${project_name}/src/services/index.ts`, servicesBarrel);

    // for modules
    for (const [key, value] of Object.entries(modules)) {
      zip.file(
        `${project_name}/src/modules/${this.toKebabCase(key)}/${this.toKebabCase(key)}.module.ts`,
        value as string,
      );
      zip.file(
        `${project_name}/src/modules/${this.toKebabCase(key)}/index.ts`,
        this.modulesService.generateBarrel([this.toKebabCase(key)]),
      );
    }
    // zip.file(`${project_name}/src/modules/index.ts`, moduleBarrel);
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
    // let kebabCaseText = text.replace(/\s+/g, '-');
    return jsConvert.toKebabCase(text);

    // kebabCaseText = kebabCaseText.toLowerCase();
    // return kebabCaseText;
  }

  removeSpaces(str: string): string {
    // Use replace method with regular expression for all whitespaces
    return str.replace(/\s/g, '');
  }
}
