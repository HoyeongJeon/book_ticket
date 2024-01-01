import { Module, forwardRef } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { ConcertsModule } from 'src/concerts/concerts.module';
import { UsersModule } from 'src/users/users.module';
import { BooksRepository } from './books.repository';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  exports: [BooksService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Book]),
    ConcertsModule,
    forwardRef(() => UsersModule),
    AuthModule,
  ],
  controllers: [BooksController],
  providers: [BooksService, BooksRepository],
})
export class BooksModule {}
