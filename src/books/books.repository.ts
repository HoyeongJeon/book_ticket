import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { Concert } from 'src/concerts/entities/concert.entity';
import { Dates } from 'src/concerts/entities/dates.entity';
import { User } from 'src/users/entities/user.entity';
import { Seat } from 'src/concerts/entities/seat.entity';
import { where } from 'sequelize';

@Injectable()
export class BooksRepository {
  private booksRepository: Repository<Book>;
  private concertsRepository: Repository<Concert>;
  private seatsRepository: Repository<Seat>;
  private datesRepository: Repository<Dates>;
  constructor(private readonly dataSource: DataSource) {
    this.booksRepository = this.dataSource.getRepository(Book);
    this.concertsRepository = this.dataSource.getRepository(Concert);
    this.seatsRepository = this.dataSource.getRepository(Seat);
    this.datesRepository = this.dataSource.getRepository(Dates);
  }

  async book(
    concertId: number,
    date: Date,
    userInfo: { userId: number; wallet: number },
    grade: string,
    seatNumber: number,
  ) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const concertWithDate = await this.datesRepository
        .createQueryBuilder('dates')
        .where('dates.concertId = :concertId AND dates.date = :date', {
          concertId,
          date,
        })
        .getOne();

      const seat = await this.seatsRepository
        .createQueryBuilder('seat')
        .where(
          'seat.concertId = :concertId AND seat.grade = :grade AND seat.seatNumber = :seatNumber AND datesId = :datesId',
          {
            concertId,
            grade,
            seatNumber,
            datesId: concertWithDate.id,
          },
        )
        .getOne();

      if (seat.isBooked) {
        throw new Error('이미 예약된 자리입니다.');
      }

      // 좌석 예약
      await this.dataSource
        .createQueryBuilder()
        .update(Seat)
        .set({
          isBooked: true,
        })
        .where(
          'datesId = :id AND grade = :grade AND seatNumber = :seatNumber',
          {
            id: concertWithDate.id,
            grade,
            seatNumber,
          },
        )
        .execute();
      // throw new Error();
      const concert = await this.concertsRepository.findOne({
        where: { id: concertId },
        relations: ['dates'],
      });
      const book = this.booksRepository.create({
        user: { id: userInfo.userId },
        concert: { id: concertId },
        date,
        grade,
        price: concert.dates[0][`price${grade}`],
        Seat: seat,
        Dates: concertWithDate,
      });
      const savedBook = await this.booksRepository.save(book);
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
    } catch (error) {
      await qr.rollbackTransaction();
      throw new BadRequestException(
        error.message || '예약 중에 오류가 발생했습니다.',
      );
    } finally {
      await qr.release();
    }
  }

  async myBooks(userId: number) {
    const myBooks = await this.dataSource
      .getRepository(Book)
      .createQueryBuilder('book')
      .where('book.userId = :userId', { userId })
      .getMany();

    return myBooks;
  }

  async findOne(id: number) {
    return await this.booksRepository.findOne({
      where: { id },
      select: ['id', 'date', 'grade'],
    });
  }

  async delete(bookingId: number, userId: Number) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const book = await this.booksRepository.findOne({
        where: { id: bookingId },
        // seat 정복 갖고와야함
        relations: {
          Seat: true,
        },
      });
      const seatId = book.Seat.id; // seat 번호
      // 예매 취소한 좌석 다시 false로 변경
      await this.dataSource
        .createQueryBuilder()
        .update(Seat)
        .set({
          isBooked: false,
        })
        .where('id = :id', {
          id: seatId,
        })
        .execute();

      // Date에 해당하는 좌석 수 + 1 해야함
      // 내가 취소한 좌석의 공연 날짜에 해당하는 좌석 수 + 1 해야함

      await this.dataSource
        .createQueryBuilder()
        .update(Dates)
        .set({
          [book.grade]: () => `${book.grade} + 1`,
        })
        .where(
          'id = (SELECT datesId FROM book WHERE id = :id) AND date = :date',
          {
            id: bookingId,
            date: book.date,
          },
        )
        .execute();

      const price = book.price;
      await this.booksRepository.delete({
        id: bookingId,
      });
      await this.dataSource
        .createQueryBuilder()
        .update(User)
        .set({
          wallet: () => `wallet + ${price}`,
        })
        .where('id = :id', {
          id: userId,
        })
        .execute();

      await qr.commitTransaction();
      return '예약이 취소되었습니다.';
    } catch (error) {
      console.log(error);
      await qr.rollbackTransaction();
      throw new InternalServerErrorException('에러가 발생했습니다.');
    } finally {
      await qr.release();
    }
  }
}
