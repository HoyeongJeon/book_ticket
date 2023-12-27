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
  ) {
    const concert = await this.concertsService.findOne(concertId);

    if (!concert) {
      throw new NotFoundException('해당 공연이 존재하지 않습니다.');
    }
    const price = concert.price;
    for (let i = 0; i < concert.dates.length; i++) {
      if (JSON.stringify(concert.dates[i].date) === JSON.stringify(date)) {
        if (concert.dates[i].seats === 0) {
          return '해당 공연의 예약 가능한 자리가 없습니다.';
        } else {
          // 가격이랑 내가 갖고있는 돈 비교
          if (price > userInfo.wallet) {
            return '잔액이 부족합니다.';
          } else {
            const book = await this.booksRepository.book(
              concertId,
              date,
              userInfo,
            );
            return book;
          }
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
