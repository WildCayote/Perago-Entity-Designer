import { ModelItem } from 'src/database/model/entities/model.entity';
import { RelationItem } from 'src/database/relations/entities/relation.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ColumnItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  type: string;

  @Column({ default: false })
  isPrimaryKey: boolean;

  @Column({ default: true })
  isNullable: boolean;

  @Column({ default: false })
  isUnique: boolean;

  @Column({ default: false })
  isForeignKey: boolean;

  @ManyToOne(() => ModelItem, (table) => table.columns)
  table: ModelItem;

  @OneToMany(() => RelationItem, (relation) => relation.columnId)
  references: RelationItem[];

  @OneToMany(() => RelationItem, (relation) => relation.referencedColumnId)
  referenced: RelationItem[];

  constructor(column: Partial<ColumnItem>) {
    Object.assign(this, column);
  }
}
