import { Injectable } from '@nestjs/common';

import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';

Injectable();
export class DtoGenService {
  async generateOutPut(entities: Model[], columns: Columns[]) {}
}
