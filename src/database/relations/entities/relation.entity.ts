import { ColumnItem } from 'src/database/columns/entities/column.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum RelationshipType {
  OneToOne = 'one-to-one',
  OneToMany = 'one-to-many',
  ManyToOne = 'many-to-one',
  // ManyToMany = 'many-to-many',
}

@Entity()
export class RelationItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: RelationshipType,
    nullable: false,
  })
  type: RelationshipType;

  

  // @Column({ default: false, nullable: false })
  // isEager: boolean;

  @Column({ default: true, nullable: false })
  isNullable: boolean;

  @Column('uuid', { name: 'columnId' })
  columnId: string;

  @ManyToOne(() => ColumnItem, (column) => column.references)
  @JoinColumn({ name: 'columnId', referencedColumnName: 'id' })
  column: ColumnItem;

  @Column('uuid', { name: 'referencedColumnId' })
  referencedColumnId: string;

  @ManyToOne(() => ColumnItem, (column) => column.referenced)
  @JoinColumn({ name: 'referencedColumnId', referencedColumnName: 'id' })
  referencedColumn: ColumnItem;

  constructor(relation: Partial<RelationItem>) {
    Object.assign(this, relation);
  }
}
