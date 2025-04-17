// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Optional: Connect explicitly on module initialization
    await this.$connect();
    console.log('Prisma Client Connected');
  }

  // Optional: Graceful shutdown hook (Need to enable in main.ts)
  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      console.log('Closing Prisma Client connection...');
      await app.close(); // This will trigger onModuleDestroy if defined
      await this.$disconnect();
      console.log('Prisma Client Disconnected');
    });
  }

  // Optional: Implement onModuleDestroy if needed for specific cleanup
  // async onModuleDestroy() {
  //   await this.$disconnect();
  // }
}