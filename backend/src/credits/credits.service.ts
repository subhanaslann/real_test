import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionTier } from '@prisma/client';

@Injectable()
export class CreditsService {
  constructor(private prisma: PrismaService) {}

  // Kredi plan limitleri
  private readonly CREDIT_LIMITS = {
    FREE: 5,
    STARTER: 25,
    PRO: 100,
    UNLIMITED: 999999,
  };

  /**
   * Kullanıcının yeterli kredisi var mı kontrol et
   */
  async checkCredits(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { creditsRemaining: true, subscriptionTier: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // UNLIMITED plan sınırsız
    if (user.subscriptionTier === SubscriptionTier.UNLIMITED) {
      return true;
    }

    return user.creditsRemaining > 0;
  }

  /**
   * Kredi harca (Job oluşturulduğunda)
   */
  async deductCredit(userId: number, jobId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { creditsRemaining: true, subscriptionTier: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // UNLIMITED plan için kredi düşürme
    if (user.subscriptionTier === SubscriptionTier.UNLIMITED) {
      // Transaction oluştur ama kredi düşürme
      await this.prisma.creditTransaction.create({
        data: {
          userId,
          jobId,
          amount: 0, // Unlimited için 0
          reason: 'JOB_CREATED',
        },
      });
      return;
    }

    if (user.creditsRemaining <= 0) {
      throw new ForbiddenException('Insufficient credits');
    }

    // Transaction içinde kredi düş ve log tut
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { creditsRemaining: { decrement: 1 } },
      }),
      this.prisma.creditTransaction.create({
        data: {
          userId,
          jobId,
          amount: -1,
          reason: 'JOB_CREATED',
        },
      }),
    ]);
  }

  /**
   * Kredi ekle (Plan upgrade, manuel ekleme vb.)
   */
  async addCredits(
    userId: number,
    amount: number,
    reason: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { creditsRemaining: { increment: amount } },
      }),
      this.prisma.creditTransaction.create({
        data: {
          userId,
          amount,
          reason,
        },
      }),
    ]);
  }

  /**
   * Aylık kredi sıfırlama (Cron job ile çağrılacak)
   */
  async resetMonthlyCredits(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newCreditAmount = this.CREDIT_LIMITS[user.subscriptionTier];

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          creditsRemaining: newCreditAmount,
          creditsTotal: newCreditAmount,
          lastCreditReset: new Date(),
        },
      }),
      this.prisma.creditTransaction.create({
        data: {
          userId,
          amount: newCreditAmount,
          reason: 'MONTHLY_RESET',
        },
      }),
    ]);
  }

  /**
   * Tüm kullanıcıların kredilerini sıfırla (Cron için)
   */
  async resetAllUsersCredits(): Promise<number> {
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    let resetCount = 0;
    for (const user of users) {
      try {
        await this.resetMonthlyCredits(user.id);
        resetCount++;
      } catch (error) {
        console.error(`Failed to reset credits for user ${user.id}:`, error);
      }
    }

    return resetCount;
  }

  /**
   * Kullanıcının kredi geçmişini getir
   */
  async getTransactionHistory(userId: number, limit: number = 50) {
    return this.prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        job: {
          select: {
            id: true,
            repoUrl: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });
  }

  /**
   * Kullanıcının kredi durumunu getir
   */
  async getCreditStatus(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        creditsRemaining: true,
        creditsTotal: true,
        subscriptionTier: true,
        lastCreditReset: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Sonraki reset tarihi hesapla (ayın ilk günü)
    const nextReset = new Date(user.lastCreditReset);
    nextReset.setMonth(nextReset.getMonth() + 1);
    nextReset.setDate(1);
    nextReset.setHours(0, 0, 0, 0);

    return {
      creditsRemaining: user.creditsRemaining,
      creditsTotal: user.creditsTotal,
      subscriptionTier: user.subscriptionTier,
      lastReset: user.lastCreditReset,
      nextReset,
      isUnlimited: user.subscriptionTier === SubscriptionTier.UNLIMITED,
    };
  }
}
