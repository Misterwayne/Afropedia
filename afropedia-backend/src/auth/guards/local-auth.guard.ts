import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    // Optional: You can override handleRequest or canActivate for custom logic
    // For example, logging before authentication attempt:
     async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log('LocalAuthGuard canActivate triggered');
        const result = (await super.canActivate(context)) as boolean;
        console.log(`LocalAuthGuard canActivate result: ${result}`);
        return result;
    }

    handleRequest(err, user, info, context, status) {
         console.log('LocalAuthGuard handleRequest:', { err, user: !!user, info: info?.message, status });
        if (err || !user) {
             // You can throw a specific error or use the default UnauthorizedException
             // Log the reason for failure if available (e.g., info.message)
            console.error('Local authentication failed:', err || info?.message);
            throw err || new UnauthorizedException(info?.message || 'Authentication failed');
        }
        return user; // Return the user object if authentication succeeds
    }
}