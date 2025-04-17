// src/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt.strategy'; // Import the payload interface

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // --- Password Hashing ---
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Recommended salt rounds
    return bcrypt.hash(password, saltRounds);
  }

  // --- Registration ---
  async register(registerUserDto: RegisterUserDto): Promise<Omit<User, 'password'>> {
    const { username, email, password } = registerUserDto;

    // Check if username or email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists.');
      }
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered.');
      }
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(password);

    try {
      // Create the user
      const newUser = await this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });

      // Exclude password from the returned user object
      const { password: _, ...result } = newUser;
      return result;
    } catch (error) {
        // Log the detailed error internally
        console.error("Registration failed:", error);
        // Provide a generic error message to the client
        throw new InternalServerErrorException('Could not register user.');
    }
  }

  // --- User Validation (for LocalStrategy / Login) ---
  async validateUser(loginIdentifier: string, pass: string): Promise<User | null> {
    // Find user by either username or email
    const user = await this.prisma.user.findFirst({
       where: {
         OR: [
           { username: loginIdentifier },
           { email: loginIdentifier },
         ],
       },
    });

    // If user found and password matches
    if (user && await bcrypt.compare(pass, user.password)) {
      // Return the full user object (including password hash)
      // The caller (LocalStrategy) will strip the password before attaching to request
      return user;
    }

    // If user not found or password doesn't match
    return null;
  }

  // --- Login (Generate JWT) ---
  async login(user: Omit<User, 'password'>) {
    // User object here comes from LocalStrategy's validate method (already password-checked)
    const payload: JwtPayload = { username: user.username, sub: user.id }; // 'sub' is standard JWT claim for subject (user ID)
     console.log(`Generating JWT for user: ${user.username} (ID: ${user.id})`); // Debug log
    return {
      access_token: this.jwtService.sign(payload),
      user: user, // Optionally return basic user info along with token
    };
  }
}