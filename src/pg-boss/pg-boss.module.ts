import { Module, Logger } from '@nestjs/common';
import { PgBossService } from './pg-boss.service';
import { CodeGenModule } from 'src/code-gen/code-gen.module';
import { PgBossGateway } from './pg-boss.gateway';


@Module({
  imports: [CodeGenModule],
  providers: [PgBossService, PgBossGateway],
  exports: [PgBossService],
})
export class PgBossModule {}
