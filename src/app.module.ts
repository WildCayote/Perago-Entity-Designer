import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ModelModule } from './model/model.module';
import { Model } from './entities/model.entity';
import { Columns } from './entities/column.entity';
import { RelationShip } from './entities/relationship.entity';
import { CodeGenModule } from './code-gen/code-gen.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'believe&achieve@suchcringe',
      database: 'PeragoEntityDB',
      entities: [Model, Columns, RelationShip],
      synchronize: true,
    }),
    ModelModule,
    CodeGenModule,
  ],
})
export class AppModule {}
