import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({ description: 'The id of the model' })
  @IsNotEmpty()
  @IsUUID()
  modelId: string;

  @ApiProperty({ description: 'The name of the column' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The type of the column' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: 'Whether the column is a primary key' })
  isPrimaryKey: boolean;

  @ApiProperty({ description: 'Whether the column is nullable' })
  isNullable: boolean;

  @ApiProperty({ description: 'Whether the column is unique' })
  isUnique: boolean;

  @ApiProperty({ description: 'Whether the column is a foreign key' })
  isForeignKey: boolean;
}
