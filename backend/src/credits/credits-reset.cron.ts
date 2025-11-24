import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreditsService } from './credits.service';

@Injectable()
export class CreditsResetCron {
  private readonly logger = new Logger(CreditsResetCron.name);

  constructor(private creditsService: CreditsService) {}

  /**
   * Her ayın 1'inde saat 00:00'da çalışır
   * Tüm kullanıcıların kredilerini sıfırlar
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyReset() {
    this.logger.log('Starting monthly credit reset...');

    try {
      const resetCount = await this.creditsService.resetAllUsersCredits();
      this.logger.log(`Monthly credit reset completed. ${resetCount} users processed.`);
    } catch (error) {
      this.logger.error('Failed to reset monthly credits:', error);
    }
  }

  /**
   * Test amaçlı - Manuel reset tetikleyici
   * Production'da kaldırılabilir
   */
  async manualReset() {
    this.logger.log('Manual credit reset triggered');
    const resetCount = await this.creditsService.resetAllUsersCredits();
    return { resetCount, message: 'Credits reset successfully' };
  }
}
