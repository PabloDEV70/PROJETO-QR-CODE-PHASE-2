import { Module } from '@nestjs/common';
import { ConstructorController } from './presentation/constructor.controller';
import { ConstructorService } from './application/constructor.service';

@Module({
  controllers: [ConstructorController],
  providers: [ConstructorService],
  exports: [ConstructorService],
})
export class ConstructorModule {}
