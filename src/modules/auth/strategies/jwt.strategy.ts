import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user';

export interface JwtPayload {
    sub: string; // user id
    email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'pantrypilot-secret-key',
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.userService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }
        // Return user object compatible with what frontend expects (plus password excluded)
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
        };
    }
}
