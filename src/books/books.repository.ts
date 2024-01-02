import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { Concert } from 'src/concerts/entities/concert.entity';
import { Dates } from 'src/concerts/entities/dates.entity';
import { User } from 'src/users/entities/user.entity';
import { Seat } from 'src/concerts/entities/seat.entity';

@Injectable()
export class BooksRepository {
  private booksRepository: Repository<Book>;
  private concertsRepository: Repository<Concert>;
  private seatsRepository: Repository<Seat>;
  constructor(private readonly dataSource: DataSource) {
    this.booksRepository = this.dataSource.getRepository(Book);
    this.concertsRepository = this.dataSource.getRepository(Concert);
    this.seatsRepository = this.dataSource.getRepository(Seat);
  }

  async book(
    concertId: number,
    date: Date,
    userInfo: { userId: number; wallet: number },
    grade: string,
    seatNumber: number,
  ) {
    // transaction 적용해야함

    const seat = await this.seatsRepository
      .createQueryBuilder('seat')
      .where(
        'seat.concertId = :concertId AND seat.grade = :grade AND seat.seatNumber = :seatNumber',
        {
          concertId,
          grade,
          seatNumber,
        },
      )
      .getOne();

    if (seat.isBooked) {
      throw new BadRequestException('이미 예약된 자리입니다.');
    }

    // 좌석 예약
    await this.dataSource
      .createQueryBuilder()
      .update(Seat)
      .set({
        isBooked: true,
      })
      .where('id = :id', {
        id: seat.id,
      })
      .execute();

    const book = this.booksRepository.create({
      user: { id: userInfo.userId },
      concert: { id: concertId },
      date,
      grade,
    });
    const savedBook = await this.booksRepository.save(book);
    const concert = await this.concertsRepository.findOne({
      where: { id: concertId },
      relations: ['dates'],
    });

    // 좌석 업데이트
    for (let i = 0; i < concert.dates.length; i++) {
      if (JSON.stringify(concert.dates[i].date) === JSON.stringify(date)) {
        concert.dates[i][grade] -= 1;
        await this.dataSource
          .createQueryBuilder()
          .update(Dates)
          .set({
            [grade]: concert.dates[i][grade],
          })
          .where('id = :id', {
            id: concert.dates[i].id,
          })
          .execute();

        break;
      }
    }
    // 내 돈도 빠져야함
    userInfo.wallet -= concert.dates[0][`price${grade}`];
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

    return myBooks;
  }
}
