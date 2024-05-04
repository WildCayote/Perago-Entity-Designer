import { Module } from '@nestjs/common';
import { PgBossService } from './pg-boss.service';
import { CodeGenModule } from 'src/code-gen/code-gen.module';

@Module({
  imports: [CodeGenModule],
  providers: [PgBossService],
  exports: [PgBossService],
})
export class PgBossModule {}
