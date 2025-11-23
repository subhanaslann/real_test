import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async findOrCreate(data: {
    githubId: string;
    username: string;
    avatarUrl?: string;
    email?: string;
  }): Promise<User> {
    const { githubId, username, avatarUrl, email } = data;

    return this.prisma.user.upsert({
      where: { githubId },
      update: {
        username,
        avatarUrl,
        email,
      },
      create: {
        githubId,
        username,
        avatarUrl,
        email,
      },
    });
  }
}
