import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreditsService } from './credits.service';

@Controller('credits')
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  /**
   * GET /credits/status
   * Kullanıcının kredi durumunu getir
   */
  @Get('status')
  async getStatus(@Req() req: any) {
    return this.creditsService.getCreditStatus(req.user.userId);
  }

  /**
   * GET /credits/history
   * Kredi transaction geçmişi
   */
  @Get('history')
  async getHistory(@Req() req: any, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.creditsService.getTransactionHistory(req.user.userId, limitNum);
  }

  /**
   * GET /credits/check
   * Kredi var mı kontrolü (boolean)
   */
  @Get('check')
  async checkCredits(@Req() req: any) {
    const hasCredits = await this.creditsService.checkCredits(req.user.userId);
    return { hasCredits };
  }
}
