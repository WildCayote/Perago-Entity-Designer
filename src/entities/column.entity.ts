import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Model } from './model.entity';

@Entity()
export class Columns {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', unique: true })
  name: string;

  @Column({ name: 'type' })
  type: string;

  @Column({ name: 'is_primary' })
  isPrimary: boolean;

  @Column({ name: 'is_unique' })
  isUnique: boolean;

  @Column({ name: 'model_id' })
  modelId: string;

  @ManyToOne((type) => Model, (model) => model.columns)
  @JoinColumn({ name: 'model_id' })
  model: Model;
}
