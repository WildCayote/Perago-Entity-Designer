import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Model } from './model.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', unique: true })
  name: string;

  @OneToMany((type) => Model, (model) => model.project)
  models: Model[];
}
