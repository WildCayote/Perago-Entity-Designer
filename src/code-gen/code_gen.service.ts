import { Injectable } from '@nestjs/common';

import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';

import {
  DtoGenService,
  EntityGenService,
  ControllerGenService,
  ServGenService,
} from './services/index';

@Injectable()
export class CodeGenService {
  constructor(
    private entityGenService: EntityGenService,
    private dtoGenService: DtoGenService,
    private controllerGenService: ControllerGenService,
    private servGenService: ServGenService,
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

    response['entityCode'] = entityCode;
    response['dtoCode'] = dtoCode;
    response['controllerCode'] = controllerCode;
    response['serviceCode'] = serviceCode;

    return response;
  }
}
