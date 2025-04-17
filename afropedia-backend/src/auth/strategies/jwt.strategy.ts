// src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service'; // Need Prisma to check if user still exists
import { User } from '@prisma/client';

// Define the shape of the JWT payload we expect
export interface JwtPayload {
  sub: number; // Subject (user ID)
  username: string;
  // Add other fields you included during JWT creation (e.g., email, roles)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService, // Inject Prisma
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Standard way: extracts "Bearer <token>" from Authorization header
      ignoreExpiration: false, // Ensure expired tokens are rejected
      secretOrKey: configService.get<string>('JWT_SECRET'), // Use the same secret key
    });
  }

  // Passport automatically calls this after verifying the JWT signature and expiration
  async validate(payload: JwtPayload): Promise<Omit<User, 'password'>> {
    console.log('JwtStrategy validating payload:', payload); // Debug log
    // Payload contains the decoded JWT ({ sub: userId, username: ... })
    // We can add extra checks here, e.g., ensure the user still exists in the DB
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
        console.log(`JwtStrategy validation failed: User ${payload.sub} not found.`); // Debug log
      throw new UnauthorizedException('User not found or token invalid.');
    }

    console.log(`JwtStrategy validation successful for user: ${user.username} (ID: ${user.id})`); // Debug log
    // Return the user object (or selected fields) to be attached to req.user
    // Exclude the password hash!
    const { password, ...result } = user;
    return result; // This object will be attached as request.user
  }
}