import { Injectable } from '@nestjs/common';

import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';

import {
  DtoGenService,
  EntityGenService,
  ControllerGenService,
  ServGenService,
  ModuleGenService,
  AppModuleGenService,
} from './services';
import { MainGenService } from './services/main_gen.service';

@Injectable()
export class CodeGenService {
  constructor(
    private entityGenService: EntityGenService,
    private dtoGenService: DtoGenService,
    private controllerGenService: ControllerGenService,
    private servGenService: ServGenService,
    private moduleGenService: ModuleGenService,
    private appModuleGenService: AppModuleGenService,
    private mainGenSerivce: MainGenService,
  ) {}

  async generateOutPut(entities: Model[], columns: Columns[]) {
    let response = new Map<string, any>();

    const entityCode = await this.entityGenService.generateOutPut(
      entities,
      columns,
    );
    const dtoCode = await this.dtoGenService.generateOutPut(entities, columns);
    const controllerCode = await this.controllerGenService.generateOutPut(
      entities,
      columns,
    );
    const serviceCode = await this.servGenService.generateOutPut(
      entities,
      columns,
    );
    const moduleCode = await this.moduleGenService.generateOutPut(
      entities,
      columns,
    );
    const appModule = await this.appModuleGenService.generateOutPut(
      entities,
      columns,
    );

    response['entityCode'] = entityCode;
    response['dtoCode'] = dtoCode;
    response['controllerCode'] = controllerCode;
    response['serviceCode'] = serviceCode;
    response['moduleCode'] = moduleCode;
    response['appModule'] = appModule;
    response['main'] = this.mainGenSerivce.generateOutPut();

    return response;
  }
}
