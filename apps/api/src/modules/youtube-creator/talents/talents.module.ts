import { Module } from '@nestjs/common';
import { TalentsService } from './talents.service';
import { TalentsController } from './talents.controller';
import { PrismaModule } from '../../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TalentsController],
  providers: [TalentsService],
  exports: [TalentsService],
})
export class TalentsModule {}
