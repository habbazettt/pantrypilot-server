import { Module, Global } from '@nestjs/common';
import { DietaryService } from './dietary.service';
import { DietaryController } from './dietary.controller';

@Global()
@Module({
    controllers: [DietaryController],
    providers: [DietaryService],
    exports: [DietaryService],
})
export class DietaryModule { }
