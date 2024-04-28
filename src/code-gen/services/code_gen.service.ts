import { Injectable } from '@nestjs/common';

import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';

import { DtoGenService, EntityGenService } from '.';

@Injectable()
export class CodeGenService {
  constructor(
    private entityGenService: EntityGenService,
    private dtoGenService: DtoGenService,
  ) {}

  async generateOutPut(entities: Model[], columns: Columns[]) {
    let response = new Map<string, any>();

    const entityCode = await this.entityGenService.generateOutPut(
      entities,
      columns,
    );

    const dtoCode = await this.dtoGenService.generateOutPut(entities, columns);

    response['entityCode'] = entityCode;
    response['dtoCode'] = dtoCode;

    return response;
  }
}
