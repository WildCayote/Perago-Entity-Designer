import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModelDto {
  @ApiProperty({ description: 'Name of the model', example: 'Example Model' })
  @IsNotEmpty()
  @IsString()
  modelName: string;

  @ApiProperty({
    description: 'Description of the model',
    example: 'This is an example model',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Project ID for the model',
  })
  @IsNotEmpty()
  @IsUUID()
  projectId: string;
}
