import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { ColumnItem } from 'src/database/columns/entities/column.entity';
import { RelationshipType } from 'src/database/relations/entities/relation.entity';

export class CreateRelationDto {
  @ApiProperty()
  // @IsNotEmpty()
  @IsOptional()
  name: string;

  @ApiProperty({ enum: RelationshipType })
  @IsEnum(RelationshipType)
  type: RelationshipType;

  // @ApiProperty()
  // @IsBoolean()
  // isEager: boolean;

  @ApiProperty()
  @IsBoolean()
  isNullable: boolean;

  @ApiProperty()
  @IsUUID()
  columnId: string;

  @ApiProperty()
  @IsUUID()
  referencedColumnId: string;
}
