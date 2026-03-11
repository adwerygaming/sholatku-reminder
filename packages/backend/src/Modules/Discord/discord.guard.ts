import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { auth } from '../../Lib/Auth.js';

export type BetterAuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export interface AuthenticatedRequest extends Request {
    session: BetterAuthSession;
}

@Injectable()
export class DiscordGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const session = await auth.api.getSession({ headers: request.headers as unknown as Headers });

        if (!session?.user) throw new UnauthorizedException('Not logged in');

        request.session = session;
        return true;
    }
}