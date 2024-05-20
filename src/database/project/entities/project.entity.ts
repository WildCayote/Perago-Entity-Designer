import { ModelItem } from 'src/database/model/entities/model.entity';
import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Entity,
} from 'typeorm';

@Entity()
export class ProjectItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  projectName: string;

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

  //   @OneToMany(() => ModelItem, (model) => model.project)
  //   models: ModelItem[];
  @OneToMany(() => ModelItem, (model) => model.project)
  models: ModelItem[];

  constructor(project: Partial<ProjectItem>) {
    Object.assign(this, project);
  }
}
