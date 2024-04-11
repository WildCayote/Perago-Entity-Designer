import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(['string', 'number', 'bool'])
  type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isPrimary: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isUnique: boolean;
}

export class UpdateColumnDto extends PartialType(CreateColumnDto) {}
