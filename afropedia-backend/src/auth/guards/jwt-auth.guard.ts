import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    // Optional: Override handleRequest to customize error handling or logging
    handleRequest(err, user, info, context, status) {
        console.log('JwtAuthGuard handleRequest:', { err, user: !!user, info: info?.message, status });
        if (err || !user) {
            // Log the reason for failure if available (e.g., info.message from passport-jwt for expired token)
            console.error('JWT authentication failed:', err || info?.message);
             throw err || new UnauthorizedException(info?.message || 'Unauthorized access');
        }
        return user; // Return the user object if JWT is valid
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log('JwtAuthGuard canActivate triggered');
        const result = (await super.canActivate(context)) as boolean;
        console.log(`JwtAuthGuard canActivate result: ${result}`);
        return result;
    }
}