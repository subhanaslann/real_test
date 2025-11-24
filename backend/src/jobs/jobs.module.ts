import { Module } from '@nestjs/common';
import { JobsService, ANALYSIS_QUEUE } from './jobs.service';
import { JobsController } from './jobs.controller';
import { BullModule } from '@nestjs/bullmq';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: ANALYSIS_QUEUE,
    }),
    CreditsModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
