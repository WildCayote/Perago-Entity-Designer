import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelModule } from './model/model.module';
import { Model } from './entities/model.entity';
import { Column } from './entities/column.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'believe&achieve@suchcringe',
      database: 'PeragoEntityDB',
      entities: [Model, Column],
      synchronize: true,
    }),
    ModelModule,
  ],
})
export class AppModule {}
