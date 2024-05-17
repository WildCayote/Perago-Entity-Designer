import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Columns } from './column.entity';
import { Project } from './project.entity';

@Entity()
@Unique(['name', 'projectId'])
export class Model {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'projectId' })
  projectId: string;

  @OneToMany((type) => Columns, (columns) => columns.model)
  columns: Columns[];

  @ManyToOne((type) => Project, (project) => project.models)
  @JoinColumn({ name: 'projectId', referencedColumnName: 'id' })
  project: Project;
}
