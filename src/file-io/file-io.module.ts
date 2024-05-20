import { Module } from '@nestjs/common';
import { FileIoService } from './file-io.service';
import { FileIoController } from './file-io.controller';
import { EntitiesService } from 'src/code-gen/entities/entities.service';
import { DtosService } from 'src/code-gen/dtos/dtos.service';
import { ControllersService } from 'src/code-gen/controllers/controllers.service';
import { ServicesService } from 'src/code-gen/services/services.service';
import { ModulesService } from 'src/code-gen/modules/modules.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnItem } from 'src/database/columns/entities/column.entity';
import { ModelItem } from 'src/database/model/entities/model.entity';
import { ProjectItem } from 'src/database/project/entities/project.entity';
import { RelationItem } from 'src/database/relations/entities/relation.entity';
import { ModelService } from 'src/database/model/model.service';
import { HandlebarsService } from 'src/handlebars.service';
import { BootstrapService } from 'src/code-gen/bootstrap/bootstrap.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ModelItem,
      ColumnItem,
      RelationItem,
      ProjectItem,
    ]),
  ],
  controllers: [FileIoController],
  providers: [
    ModelService,
    HandlebarsService,
    FileIoService,
    EntitiesService,
    DtosService,
    ControllersService,
    ServicesService,
    ModulesService,
    BootstrapService,
  ],
})
export class FileIoModule {}
