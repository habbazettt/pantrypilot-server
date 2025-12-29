import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Recipe } from '../../recipe/entities';

export enum FeedbackType {
    RATING = 'rating',
    CORRECTION = 'correction',
    COMMENT = 'comment',
}

@Entity('feedbacks')
export class Feedback {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column('uuid')
    recipeId: string;

    @ManyToOne(() => Recipe, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'recipeId' })
    recipe: Recipe;

    @Index()
    @Column({ length: 64, nullable: true })
    sessionId: string; // anonymous session ID (legacy)

    @Index()
    @Column('uuid', { nullable: true })
    userId: string; // authenticated user ID

    @Column({ type: 'enum', enum: FeedbackType, default: FeedbackType.RATING })
    type: FeedbackType;

    @Column({ type: 'int', nullable: true })
    rating: number; // 1-5 stars

    @Column({ type: 'text', nullable: true })
    comment: string;

    @Column({ type: 'simple-json', nullable: true })
    corrections: {
        field: string;
        originalValue: string;
        suggestedValue: string;
    }[];

    @Column({ type: 'boolean', default: false })
    isApproved: boolean; // for moderation

    @CreateDateColumn()
    createdAt: Date;
}
