import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);
  private readonly tempRoot = path.join(os.tmpdir(), 'flutter-sentinel');

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Running cleanup cron job...');
    
    try {
      if (!(await fs.pathExists(this.tempRoot))) {
         this.logger.log('Temp directory does not exist, skipping cleanup.');
         return;
      }

      const items = await fs.readdir(this.tempRoot);
      const now = Date.now();
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;

      for (const item of items) {
        const itemPath = path.join(this.tempRoot, item);
        try {
          const stats = await fs.stat(itemPath);
          const age = now - stats.birthtimeMs;

          if (stats.isDirectory() && age > ONE_DAY_MS) {
             this.logger.log(`Deleting old directory: ${itemPath} (Age: ${(age / 3600000).toFixed(2)} hours)`);
             await fs.remove(itemPath);
          }
        } catch (err: any) {
          this.logger.error(`Error processing item ${itemPath}: ${err.message}`);
        }
      }
      
      this.logger.log('Cleanup complete.');
    } catch (error) {
      this.logger.error('Cleanup job failed', error);
    }
  }
}
