import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { Concert } from 'src/concerts/entities/concert.entity';
import { Dates } from 'src/concerts/entities/dates.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BooksRepository {
  private booksRepository: Repository<Book>;
  private concertsRepository: Repository<Concert>;
  constructor(private readonly dataSource: DataSource) {
    this.booksRepository = this.dataSource.getRepository(Book);
    this.concertsRepository = this.dataSource.getRepository(Concert);
  }

  async book(
    concertId: number,
    date: Date,
    userInfo: { userId: number; wallet: number },
  ) {
    const book = this.booksRepository.create({
      user: { id: userInfo.userId },
      concert: { id: concertId },
      date,
    });
    const savedBook = await this.booksRepository.save(book);
    const concert = await this.concertsRepository.findOne({
      where: { id: concertId },
      relations: ['dates'],
    });

    // 좌석 업데이트
    for (let i = 0; i < concert.dates.length; i++) {
      if (JSON.stringify(concert.dates[i].date) === JSON.stringify(date)) {
        concert.dates[i].seats -= 1;
        await this.dataSource
          .createQueryBuilder()
          .update(Dates)
          .set({
            seats: concert.dates[i].seats,
          })
          .where('id = :id', {
            id: concert.dates[i].id,
          })
          .execute();

        break;
      }
    }
    // 내 돈도 빠져야함
    userInfo.wallet -= concert.price;
    await this.dataSource
      .createQueryBuilder()
      .update(User)
      .set({
        wallet: userInfo.wallet,
      })
      .where('id = :id', {
        id: userInfo.userId,
      })
      .execute();
    return savedBook;
  }

  async myBooks(userId: number) {
    const myBooks = await this.dataSource
      .getRepository(Book)
      .createQueryBuilder('book')
      .where('book.userId = :userId', { userId })
      .getMany();

    console.log(myBooks);
    return myBooks;
  }
}
