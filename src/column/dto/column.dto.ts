import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateRelationDto } from './relation.dto';
import { Type } from 'class-transformer';

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
  @IsOptional()
  @IsBoolean()
  isPrimary: boolean = false;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isUnique: boolean = false;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isForiegn: boolean = false;

  @ApiProperty()
  @ValidateIf((obj) => obj.isForiegn)
  @IsNotEmpty({ message: '' })
  @ValidateNested()
  @Type(() => CreateRelationDto)
  relation?: CreateRelationDto;
}

export class UpdateColumnDto extends PartialType(CreateColumnDto) {}
