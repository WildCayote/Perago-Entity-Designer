export class Model {}
import { ColumnItem } from 'src/database/columns/entities/column.entity';
import { ProjectItem } from 'src/database/project/entities/project.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ModelItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  modelName: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => ProjectItem, (project) => project.models)
  project: ProjectItem;

  @OneToMany(() => ColumnItem, (column) => column.table)
  columns: ColumnItem[];

  constructor(model: Partial<ModelItem>) {
    Object.assign(this, model);
  }
}
