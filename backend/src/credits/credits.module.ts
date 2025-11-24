import { Module } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { SubscriptionService } from './subscription.service';
import { CreditsController } from './credits.controller';
import { SubscriptionController } from './subscription.controller';
import { CreditsResetCron } from './credits-reset.cron';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CreditsService, SubscriptionService, CreditsResetCron],
  controllers: [CreditsController, SubscriptionController],
  exports: [CreditsService, SubscriptionService],
})
export class CreditsModule {}
