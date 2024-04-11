import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Column {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
