import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class SessionService {
    private readonly logger = new Logger(SessionService.name);
    private readonly SESSION_PREFIX = 'session:';
    private readonly SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

    constructor(@InjectRedis() private readonly redis: Redis) { }

    /**
     * Generate a new session token
     */
    generateSessionToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Create a new session and store in Redis
     */
    async createSession(): Promise<string> {
        const token = this.generateSessionToken();
        const sessionData = {
            createdAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
        };

        await this.redis.setex(
            `${this.SESSION_PREFIX}${token}`,
            this.SESSION_TTL,
            JSON.stringify(sessionData),
        );

        this.logger.log(`Session created: ${token.slice(0, 8)}...`);
        return token;
    }

    /**
     * Validate and refresh session
     */
    async validateSession(token: string): Promise<boolean> {
        const key = `${this.SESSION_PREFIX}${token}`;
        const data = await this.redis.get(key);

        if (!data) {
            return false;
        }

        // Refresh TTL on access
        const sessionData = JSON.parse(data);
        sessionData.lastAccessedAt = new Date().toISOString();
        await this.redis.setex(key, this.SESSION_TTL, JSON.stringify(sessionData));

        return true;
    }

    /**
     * Get session data
     */
    async getSession(token: string): Promise<Record<string, any> | null> {
        const data = await this.redis.get(`${this.SESSION_PREFIX}${token}`);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Delete session
     */
    async deleteSession(token: string): Promise<boolean> {
        const result = await this.redis.del(`${this.SESSION_PREFIX}${token}`);
        return result > 0;
    }

    /**
     * Get or create session token from request header
     */
    async getOrCreateSession(existingToken?: string): Promise<string> {
        if (existingToken && (await this.validateSession(existingToken))) {
            return existingToken;
        }
        return this.createSession();
    }
}
