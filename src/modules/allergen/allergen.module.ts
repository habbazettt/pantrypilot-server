import { Module, Global } from '@nestjs/common';
import { AllergenService } from './allergen.service';
import { AllergenController } from './allergen.controller';

@Global()
@Module({
    controllers: [AllergenController],
    providers: [AllergenService],
    exports: [AllergenService],
})
export class AllergenModule { }
