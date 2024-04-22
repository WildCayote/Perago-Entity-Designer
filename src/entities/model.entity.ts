import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Columns } from './column.entity';

@Entity()
export class Model {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', unique: true })
  name: string;

  @OneToMany((type) => Columns, (columns) => columns.model)
  columns: Columns[];
}
