import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async setTelegramIdByClientId(
    telegramId: number,
    clientId: string,
  ): Promise<User | null> {
    const dbUser = await this.user({ clientId: clientId });

    if (!dbUser) return null;

    return await this.updateUser({
      where: { id: dbUser.id },
      data: {
        telegramId: telegramId,
      },
    });
  }

  async user(userWhereInput: Prisma.UserWhereInput): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: userWhereInput,
    });
  }

  async userUnique(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async findOrCreateUserByClientId(clientId: string): Promise<User | null> {
    let user = await this.userUnique({ clientId: clientId });

    if (!user) {
      user = await this.createUser({
        clientId: clientId,
      });
    }

    return user;
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
