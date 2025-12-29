import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories';
import { CreateUserDto } from '../dto';
import { User } from '../entities';

@Injectable()
export class UserService {
    private readonly SALT_ROUNDS = 10;

    constructor(private readonly userRepository: UserRepository) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    async create(dto: CreateUserDto): Promise<User> {
        // Check if email already exists
        const exists = await this.userRepository.existsByEmail(dto.email);
        if (exists) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

        // Create user
        return this.userRepository.create({
            email: dto.email,
            password: hashedPassword,
            name: dto.name,
        });
    }

    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}
