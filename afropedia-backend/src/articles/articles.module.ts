import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [PrismaClient, PrismaModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, PrismaClient], 
})
export class ArticlesModule {}
