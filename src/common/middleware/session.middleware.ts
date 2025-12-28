import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../../modules/session';

// Extend Express Request to include sessionToken
declare global {
    namespace Express {
        interface Request {
            sessionToken?: string;
        }
    }
}

@Injectable()
export class SessionMiddleware implements NestMiddleware {
    private readonly logger = new Logger(SessionMiddleware.name);
    private readonly SESSION_HEADER = 'x-session-token';

    constructor(private readonly sessionService: SessionService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const existingToken = req.headers[this.SESSION_HEADER] as string | undefined;

        // Get or create session
        const sessionToken = await this.sessionService.getOrCreateSession(existingToken);

        // Attach to request
        req.sessionToken = sessionToken;

        // Set response header so client knows the token
        res.setHeader(this.SESSION_HEADER, sessionToken);

        next();
    }
}
