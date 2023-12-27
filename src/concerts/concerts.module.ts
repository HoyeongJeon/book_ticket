import { Module } from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { ConcertsController } from './concerts.controller';
import { Concert } from './entities/concert.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Category } from './entities/category.entity';
import { Seat } from './entities/seat.entity';
import { ConcertsRepository } from './concerts.repository';
import { Dates } from './entities/dates.entity';

@Module({
  exports: [ConcertsService, ConcertsRepository],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Concert, Seat, Category, Dates]),
  ],
  controllers: [ConcertsController],
  providers: [ConcertsService, ConcertsRepository],
})
export class ConcertsModule {}
