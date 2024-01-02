import { Injectable, NotFoundException } from '@nestjs/common';
import { BooksRepository } from './books.repository';
import { ConcertsService } from 'src/concerts/concerts.service';

@Injectable()
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
  ) {
    const concert = await this.concertsService.findOne(concertId);

    if (!concert) {
      throw new NotFoundException('해당 공연이 존재하지 않습니다.');
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

        console.log(price);
        // 가격이랑 내가 갖고있는 돈 비교
        if (price > userInfo.wallet) {
          return '잔액이 부족합니다.';
        } else {
          const book = await this.booksRepository.book(
            concertId,
            date,
            userInfo,
            grade,
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
}
