// src/auth/auth.controller.ts
import { Controller, Post, Body, Request, UseGuards, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard'; // We will create this
import { JwtAuthGuard } from './guards/jwt-auth.guard';   // We will create this
import { User } from '@prisma/client'; // Import User type if needed for type hints
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';

// Helper type for the request object after LocalAuthGuard runs
interface RequestWithUser extends Request {
    user: Omit<User, 'password'>
}
// Helper type for the request object after JwtAuthGuard runs
interface AuthenticatedRequest extends Request {
    user: Omit<User, 'password'> // The shape returned by JwtStrategy.validate
}


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.'})
  @ApiResponse({ status: 400, description: 'Bad Request (validation failed).'})
  @ApiResponse({ status: 409, description: 'Conflict (username or email already exists).'})
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  // Use LocalAuthGuard to trigger the LocalStrategy validation
  @UseGuards(LocalAuthGuard) // This guard runs LocalStrategy.validate() before the handler
  @Post('login')
  @HttpCode(HttpStatus.OK) // Set success status code to 200
  @ApiOperation({ summary: 'Log in a user and return JWT' })
  @ApiBody({ type: LoginUserDto }) // Explicitly define body for Swagger
  @ApiResponse({ status: 200, description: 'Login successful, JWT returned.'})
  @ApiResponse({ status: 401, description: 'Unauthorized (invalid credentials).'})
  async login(@Request() req: RequestWithUser) {
    // If LocalAuthGuard passes, req.user contains the user object returned by LocalStrategy.validate
    console.log('Login endpoint reached, user:', req.user); // Debug log
    return this.authService.login(req.user); // Generate and return JWT
  }

  // Example of a protected route - requires a valid JWT
  @UseGuards(JwtAuthGuard) // This guard runs JwtStrategy.validate()
  @Get('profile')
  @ApiBearerAuth() // Indicate Swagger UI that this needs Bearer token auth
  @ApiOperation({ summary: 'Get the profile of the currently logged-in user' })
  @ApiResponse({ status: 200, description: 'User profile retrieved.'})
  @ApiResponse({ status: 401, description: 'Unauthorized (invalid or missing token).'})
  getProfile(@Request() req: AuthenticatedRequest) {
    // If JwtAuthGuard passes, req.user contains the user object returned by JwtStrategy.validate
    console.log('Profile endpoint reached, user:', req.user); // Debug log
    return req.user; // Return the authenticated user's data
  }
}