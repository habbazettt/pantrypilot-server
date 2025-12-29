import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user';
import { RegisterDto } from '../dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (user && await this.userService.validatePassword(password, user.password)) {
            const { password: _, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        this.logger.log(`User logged in: ${user.email}`);
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }

    async register(dto: RegisterDto) {
        const user = await this.userService.create(dto);
        this.logger.log(`New user registered: ${user.email}`);

        // Auto-login after registration
        const { password: _, ...userWithoutPassword } = user;
        return this.login(userWithoutPassword);
    }
}
