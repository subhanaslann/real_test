import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';

enum SubscriptionTierEnum {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  UNLIMITED = 'UNLIMITED',
}

class ChangePlanDto {
  @IsEnum(SubscriptionTierEnum)
  @IsNotEmpty()
  tier: 'FREE' | 'STARTER' | 'PRO' | 'UNLIMITED';
}

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * GET /subscription/current
   * Kullanıcının mevcut planı
   */
  @Get('current')
  async getCurrentPlan(@Req() req: any) {
    return this.subscriptionService.getCurrentPlan(req.user.userId);
  }

  /**
   * GET /subscription/plans
   * Tüm planları listele
   */
  @Get('plans')
  async getAllPlans() {
    return this.subscriptionService.getAllPlans();
  }

  /**
   * POST /subscription/change
   * Plan değiştir
   */
  @Post('change')
  async changePlan(@Req() req: any, @Body() dto: ChangePlanDto) {
    await this.subscriptionService.changePlan(req.user.userId, dto.tier as any);
    return { success: true, message: 'Plan successfully changed' };
  }
}
