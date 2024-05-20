import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';



import { CodeGenService } from './code-gen.service';

// import { RelationShip } from 'src/entities/relationship.entity';
import { RelationItem, RelationItem  as RelationShip} from 'src/database/relations/entities/relation.entity';
import { Model, ModelItem } from 'src/database/model/entities/model.entity';
import { ModelModule } from 'src/database/model/model.module';
import { HandlebarsService } from 'src/handlebars.service';
import { BootstrapService } from './bootstrap/bootstrap.service';
import { ControllersService } from './controllers/controllers.service';
import { DtosService } from './dtos/dtos.service';
import { EntitiesService } from './entities/entities.service';
import { ModulesService } from './modules/modules.service';
import { ServicesService } from './services/services.service';
import { ColumnItem } from 'src/database/columns/entities/column.entity';
import { ProjectItem } from 'src/database/project/entities/project.entity';

@Module({
  imports: [
    forwardRef(() => ModelModule),
    TypeOrmModule.forFeature([ ModelItem,
      ColumnItem,
      RelationItem,
      ProjectItem, ]),
  ],
  providers: [
    HandlebarsService,
    EntitiesService,
    DtosService,
    ControllersService,
    ServicesService,
    ModulesService,
    BootstrapService,
    CodeGenService,
  ],
  exports: [CodeGenService],
})
export class CodeGenModule {}
