import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionTier } from '@prisma/client';
import { CreditsService } from './credits.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
  ) {}

  // Plan fiyatları (TL/Ay)
  private readonly PLAN_PRICES = {
    FREE: 0,
    STARTER: 99,
    PRO: 299,
    UNLIMITED: 999,
  };

  // Plan özellikleri
  private readonly PLAN_FEATURES = {
    FREE: {
      credits: 5,
      privateRepos: false,
      priority: false,
      support: 'Community',
    },
    STARTER: {
      credits: 25,
      privateRepos: true,
      priority: false,
      support: 'Email',
    },
    PRO: {
      credits: 100,
      privateRepos: true,
      priority: true,
      support: 'Priority Email',
    },
    UNLIMITED: {
      credits: 999999,
      privateRepos: true,
      priority: true,
      support: '24/7 Support',
    },
  };

  /**
   * Kullanıcının mevcut planını getir
   */
  async getCurrentPlan(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        creditsRemaining: true,
        creditsTotal: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      tier: user.subscriptionTier,
      price: this.PLAN_PRICES[user.subscriptionTier],
      features: this.PLAN_FEATURES[user.subscriptionTier],
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
      creditsRemaining: user.creditsRemaining,
      creditsTotal: user.creditsTotal,
    };
  }

  /**
   * Tüm planları listele
   */
  getAllPlans() {
    return Object.keys(SubscriptionTier).map((tier) => ({
      tier,
      price: this.PLAN_PRICES[tier],
      features: this.PLAN_FEATURES[tier],
    }));
  }

  /**
   * Plan yükselt (Upgrade)
   */
  async upgradePlan(userId: number, newTier: SubscriptionTier): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Aynı veya daha düşük plana geçiş engelleniyor
    const tierOrder = ['FREE', 'STARTER', 'PRO', 'UNLIMITED'];
    const currentIndex = tierOrder.indexOf(user.subscriptionTier);
    const newIndex = tierOrder.indexOf(newTier);

    if (newIndex <= currentIndex) {
      throw new BadRequestException('Cannot upgrade to same or lower tier. Use downgradePlan instead.');
    }

    const newCreditLimit = this.PLAN_FEATURES[newTier].credits;

    // Plan değiştir ve kredileri güncelle
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: newTier,
          creditsRemaining: newCreditLimit,
          creditsTotal: newCreditLimit,
          subscriptionStartDate: new Date(),
          subscriptionEndDate: null, // Aylık otomatik yenilenecek
        },
      }),
      this.prisma.creditTransaction.create({
        data: {
          userId,
          amount: newCreditLimit,
          reason: 'PLAN_UPGRADE',
        },
      }),
    ]);
  }

  /**
   * Plan düşür (Downgrade)
   */
  async downgradePlan(userId: number, newTier: SubscriptionTier): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true, creditsRemaining: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Aynı veya daha yüksek plana geçiş engelleniyor
    const tierOrder = ['FREE', 'STARTER', 'PRO', 'UNLIMITED'];
    const currentIndex = tierOrder.indexOf(user.subscriptionTier);
    const newIndex = tierOrder.indexOf(newTier);

    if (newIndex >= currentIndex) {
      throw new BadRequestException('Cannot downgrade to same or higher tier. Use upgradePlan instead.');
    }

    const newCreditLimit = this.PLAN_FEATURES[newTier].credits;

    // Mevcut krediler yeni limitten fazla ise limitle
    const newCreditsRemaining = Math.min(user.creditsRemaining, newCreditLimit);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: newTier,
          creditsRemaining: newCreditsRemaining,
          creditsTotal: newCreditLimit,
          subscriptionStartDate: new Date(),
        },
      }),
      this.prisma.creditTransaction.create({
        data: {
          userId,
          amount: 0, // Downgrade'de kredi değişimi yok, sadece limit değişiyor
          reason: 'PLAN_DOWNGRADE',
        },
      }),
    ]);
  }

  /**
   * Plan değiştir (Otomatik upgrade/downgrade algılar)
   */
  async changePlan(userId: number, newTier: SubscriptionTier): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.subscriptionTier === newTier) {
      throw new BadRequestException('Already on this plan');
    }

    const tierOrder = ['FREE', 'STARTER', 'PRO', 'UNLIMITED'];
    const currentIndex = tierOrder.indexOf(user.subscriptionTier);
    const newIndex = tierOrder.indexOf(newTier);

    if (newIndex > currentIndex) {
      await this.upgradePlan(userId, newTier);
    } else {
      await this.downgradePlan(userId, newTier);
    }
  }

  /**
   * Abonelik bitmiş mi kontrol et ve gerekirse kredi sıfırla
   */
  async checkAndResetCredits(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastCreditReset: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = new Date();
    const lastReset = new Date(user.lastCreditReset);

    // Son reset'ten bu yana 1 ay geçmiş mi?
    const nextResetDate = new Date(lastReset);
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);

    if (now >= nextResetDate) {
      await this.creditsService.resetMonthlyCredits(userId);
    }
  }
}
