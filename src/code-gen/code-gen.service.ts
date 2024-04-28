import { Injectable } from '@nestjs/common';

import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';

import { EntityGenService } from './services';

@Injectable()
export class CodeGenService {
  constructor(private entityGenService: EntityGenService) {}

  async generateOutPut(entities: Model[], columns: Columns[]) {
    let response = new Map<string, any>();

    const entityCode = await this.entityGenService.generateOutPut(
      entities,
      columns,
    );

    response['entityCode'] = entityCode;

    return response;
  }
}
