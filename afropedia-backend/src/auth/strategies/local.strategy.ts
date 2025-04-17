// src/auth/strategies/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client'; // Use Prisma User type

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
        // By default, passport-local expects 'username' and 'password'.
        // We map our DTO's 'loginIdentifier' to 'username' internally here.
        usernameField: 'loginIdentifier'
    });
  }

  // Passport automatically calls this validate method with credentials from the request body
  async validate(loginIdentifier: string, password: string): Promise<Omit<User, 'password'>> {
    console.log(`LocalStrategy validating: ${loginIdentifier}`); // Debug log
    const user = await this.authService.validateUser(loginIdentifier, password);
    if (!user) {
      console.log(`LocalStrategy validation failed for: ${loginIdentifier}`); // Debug log
      throw new UnauthorizedException('Invalid credentials');
    }
    console.log(`LocalStrategy validation successful for: ${loginIdentifier}`); // Debug log
    // Return user object (without password) if validation succeeds
    // Passport attaches this to req.user
    const { password: _, ...result } = user; // Exclude password
    return result;
  }
}