import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { UsersReposiory } from './users.repository';
import { AuthModule } from 'src/auth/auth.module';
import { BooksModule } from 'src/books/books.module';

@Module({
  exports: [UsersReposiory],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    forwardRef(() => BooksModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersReposiory],
})
export class UsersModule {}
