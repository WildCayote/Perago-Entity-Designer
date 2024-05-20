import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'postgres', //postgres
  password: 'dawit', //postgres
  database: 'dawit',
  synchronize: true,
  autoLoadEntities: true,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  // logging: true,
  // entities: [__dirname + '/../**/*.entity.{ts,js}'],
  // migrations: [__dirname + '/../**/*.{ts,js}'],
  // subscribers: [__dirname + '/../**/*.{ts,js}'],
};
