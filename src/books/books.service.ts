import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { BooksRepository } from './books.repository';
import { ConcertsService } from 'src/concerts/concerts.service';
import { AccessTokenGuard } from 'src/auth/guard/LoggedIn.guard';

@Injectable()
@UseGuards(AccessTokenGuard)
export class BooksService {
  constructor(
    private readonly concertsService: ConcertsService,
    private readonly booksRepository: BooksRepository,
  ) {}
  async book(
    concertId: number,
    date: Date,
    userInfo: { userId: number; wallet: number },
    grade: string,
    seatNumber: number,
  ) {
    const concert = await this.concertsService.findOne(concertId);

    if (!concert) {
      throw new NotFoundException('해당 공연이 존재하지 않습니다.');
    }

    if (!concert.is_booking_open) {
      throw new NotFoundException('예약이 불가능한 공연입니다.');
    }

    for (let i = 0; i < concert.dates.length; i++) {
      if (JSON.stringify(concert.dates[i].date) === JSON.stringify(date)) {
        // 자리가 없으면 예약 불가능
        if (concert.dates[i].S === 0 && grade === 'S') {
          return '해당 등급의 예약 가능한 자리가 없습니다.';
        }
        if (concert.dates[i].B === 0 && grade === 'B') {
          return '해당 등급의 예약 가능한 자리가 없습니다.';
        }
        if (concert.dates[i].A === 0 && grade === 'A') {
          return '해당 등급의 예약 가능한 자리가 없습니다.';
        }

        const price = concert.dates[i][`price${grade}`];

        // 가격이랑 내가 갖고있는 돈 비교
        if (price > userInfo.wallet) {
          return '잔액이 부족합니다.';
        } else {
          const book = await this.booksRepository.book(
            concertId,
            date,
            userInfo,
            grade,
            seatNumber,
          );
          return book;
        }
      }
    }
    throw new NotFoundException('해당 공연이 존재하지 않습니다.');
  }
  async myBooks(userId: number) {
    const myBooks = await this.booksRepository.myBooks(userId);
    return myBooks;
  }

  async delete(bookingId: number, userId: number) {
    const book = await this.booksRepository.findOne(bookingId);

    if (!book) {
      throw new NotFoundException('해당 예약이 존재하지 않습니다.');
    }

    const timeDiff =
      (book.date.getTime() - new Date().getTime()) / (60 * 60 * 1000);

    if (timeDiff < 3) {
      throw new NotFoundException('취소가능 시간이 지났습니다.');
    }

    // const grade = book.grade;

    return await this.booksRepository.delete(bookingId, userId);
  }
}
