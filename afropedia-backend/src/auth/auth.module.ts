// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule if AuthService needs PrismaService (it will)
import { JwtStrategy } from './strategies/jwt.strategy'; // We will create this
import { LocalStrategy } from './strategies/local.strategy'; // We will create this
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule/Service

@Module({
  imports: [
    PrismaModule, // Make PrismaService available
    PassportModule,
    ConfigModule.forRoot(), // Make sure ConfigModule is loaded (usually in AppModule is better, but here works too if not global)
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule here too
      inject: [ConfigService], // Inject ConfigService
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME', '3600s'), // Default to 1 hour if not set
        },
      }),
    }),
  ],
  controllers: [AuthController],
  // Register strategies as providers
  providers: [AuthService, LocalStrategy, JwtStrategy],
  // Optionally export AuthService or JwtModule if needed elsewhere, but often not necessary
})
export class AuthModule {}