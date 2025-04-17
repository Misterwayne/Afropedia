// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({ // Configure ConfigModule
      isGlobal: true,      // Make it global
    }),
    PrismaModule,
    ArticlesModule,
    AuthModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}