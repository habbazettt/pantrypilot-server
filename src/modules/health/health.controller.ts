import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
    HealthCheckService,
    HealthCheck,
    TypeOrmHealthIndicator,
    HealthCheckResult,
} from '@nestjs/terminus';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
        @InjectRedis() private readonly redis: Redis,
    ) { }

    @Get()
    @HealthCheck()
    @ApiOperation({
        summary: 'Health check',
        description: 'Check the health status of the application, database, and Redis',
    })
    @ApiResponse({
        status: 200,
        description: 'Application is healthy',
    })
    @ApiResponse({
        status: 503,
        description: 'Application is unhealthy',
    })
    check(): Promise<HealthCheckResult> {
        return this.health.check([
            // Database health check
            () => this.db.pingCheck('database'),
            // Redis health check
            async () => {
                try {
                    const pong = await this.redis.ping();
                    return {
                        redis: {
                            status: pong === 'PONG' ? 'up' : 'down',
                        },
                    };
                } catch {
                    return {
                        redis: {
                            status: 'down',
                        },
                    };
                }
            },
        ]);
    }
}
