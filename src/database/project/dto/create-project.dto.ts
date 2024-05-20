import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ description: 'The name of the project' })
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @ApiProperty({ description: 'The description of the project' })
  @IsString()
  description: string;
}
