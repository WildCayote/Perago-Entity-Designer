import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { Model } from './model.entity';
import { RelationShip } from './relationship.entity';

@Entity()
@Unique(['name', 'modelId'])
export class Columns {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'type' })
  type: string;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ default: false })
  isNullable: boolean;

  @Column({ name: 'is_foriegn', default: false })
  isForiegn: boolean;

  @Column({ name: 'is_unique', default: false })
  isUnique: boolean;

  @Column({ name: 'model_id' })
  modelId: string;

  @ManyToOne((type) => Model, (model) => model.columns)
  @JoinColumn({ name: 'model_id', referencedColumnName: 'id' })
  model: Model;

  @OneToOne((type) => RelationShip, (relationship) => relationship.column, {
    nullable: true,
    eager: true,
  })
  relation: RelationShip;

  @OneToMany(
    (type) => RelationShip,
    (relationship) => relationship.referencedColumn,
    { eager: true },
  )
  references: RelationShip[];
}
