import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
