import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities';
import { FeedbackRepository } from './repositories';
import { FeedbackService } from './services';
import { FeedbackController } from './controllers';

@Module({
    imports: [TypeOrmModule.forFeature([Feedback])],
    controllers: [FeedbackController],
    providers: [FeedbackRepository, FeedbackService],
    exports: [FeedbackService],
})
export class FeedbackModule { }
