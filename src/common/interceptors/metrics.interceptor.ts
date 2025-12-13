import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(
        @InjectMetric('http_requests_total')
        private readonly requestCounter: Counter<string>,
        @InjectMetric('http_request_duration_seconds')
        private readonly requestDuration: Histogram<string>,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const { method, route } = request;
        const routePath = route?.path || request.url;

        const endTimer = this.requestDuration.startTimer({
            method,
            route: routePath,
        });

        return next.handle().pipe(
            tap(() => {
                const { statusCode } = response;

                this.requestCounter.inc({
                    method,
                    route: routePath,
                    status: statusCode.toString(),
                });

                endTimer({ status: statusCode.toString() });
            }),
        );
    }
}
