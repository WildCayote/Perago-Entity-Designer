import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Columns } from './column.entity';

@Entity()
@Unique(['columnId', 'referencedColumnId'])
export class RelationShip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'type', enum: ['one-to-one', 'many-to-one', 'many-to-many'] })
  type: string;

  @Column({ name: 'eager', default: false })
  eager: boolean;

  @Column({ name: 'nullable', default: true })
  nullable: boolean;

  @Column({ name: 'columnId' })
  columnId: string;

  @ManyToOne((type) => Columns, (column) => column.relation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'columnId', referencedColumnName: 'id' })
  column: Columns;

  @Column({ name: 'referencedColumnId' })
  referencedColumnId: string;

  @ManyToOne((type) => Columns, (column) => column.references, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'referencedColumnId', referencedColumnName: 'id' })
  referencedColumn: Columns;
}
