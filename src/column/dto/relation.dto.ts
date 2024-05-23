import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateRelationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(['one-to-one', 'many-to-one', 'one-to-many'])
  type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  referencedColumnId: string;

  @ApiProperty()
  @IsBoolean()
  eager: boolean = false;

  @ApiProperty()
  @IsBoolean()
  nullable: boolean = true;
}
