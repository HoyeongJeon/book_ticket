import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Concert } from './entities/concert.entity';
import { CreateConcertDto } from './dto/concert.dto';
import { Category } from './entities/category.entity';
import { Dates } from './entities/dates.entity';
import { Seat } from './entities/seat.entity';

@Injectable()
export class ConcertsRepository {
  private concertsRepository: Repository<Concert>;
  private datesRepository: Repository<Dates>;
  private seatsRepository: Repository<Seat>;
  constructor(private readonly dataSource: DataSource) {
    this.concertsRepository = this.dataSource.getRepository(Concert);
    this.datesRepository = this.dataSource.getRepository(Dates);
    this.seatsRepository = this.dataSource.getRepository(Seat);
  }

  async create(createConcertDto: CreateConcertDto) {
    const dateDtos = createConcertDto.dates;

    // trnasaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const concert = this.concertsRepository.create({
        title: createConcertDto.title,
        description: createConcertDto.description,
        location: createConcertDto.location,
        img_url: createConcertDto.img_url,
        is_booking_open: createConcertDto.is_booking_open,
        category: createConcertDto.category,
      });
      const savedConcert = await this.concertsRepository.save(concert);

      const concertSchedule = dateDtos.map((dateDto) => {
        return this.datesRepository.create({
          date: new Date(dateDto as any),
          S: createConcertDto.S,
          priceS: createConcertDto.priceS,
          A: createConcertDto.A,
          priceA: createConcertDto.priceA,
          B: createConcertDto.B,
          priceB: createConcertDto.priceB,
          concert: savedConcert,
        });
      });
      await this.datesRepository.save(concertSchedule);
      for (let i = 0; i < concertSchedule.length; i++) {
        for (let j = 0; j < createConcertDto.S; j++) {
          const seat = this.seatsRepository.create({
            seatNumber: j + 1,
            grade: 'S',
            dates: concertSchedule[i],
            concertId: savedConcert.id,
          });
          await this.seatsRepository.save(seat);
        }
        for (let j = 0; j < createConcertDto.A; j++) {
          const seat = this.seatsRepository.create({
            seatNumber: j + 1,
            grade: 'A',
            dates: {
              id: concertSchedule[i].id,
            },
            concertId: savedConcert.id,
          });
          await this.seatsRepository.save(seat);
        }
        for (let j = 0; j < createConcertDto.B; j++) {
          const seat = this.seatsRepository.create({
            seatNumber: j + 1,
            grade: 'B',
            dates: {
              id: concertSchedule[i].id,
            },
            concertId: savedConcert.id,
          });
          await this.seatsRepository.save(seat);
        }
      }

      await queryRunner.commitTransaction();
      return concertSchedule;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.concertsRepository.find();
  }

  async findAllOnlyName() {
    return await this.concertsRepository.find({
      select: ['title'],
    });
  }
  async findOne(id: number) {
    return await this.concertsRepository
      .createQueryBuilder('concert')
      .leftJoin('concert.dates', 'dates')
      .where('concert.id = dates.concertId', { id })
      .select([
        'concert.title',
        'concert.img_url',
        'concert.description',
        'concert.location',
        'concert.is_booking_open',
        'dates.date',
        'dates.S',
        'dates.priceS',
        'dates.A',
        'dates.priceA',
        'dates.B',
        'dates.priceB',
      ])
      .getOne();
  }

  async search(keyword: string) {
    return await this.concertsRepository
      .createQueryBuilder('concert')
      .where('concert.title LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('concert.category LIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  }

  async save(concert: Concert) {
    return await this.concertsRepository.save(concert);
  }

  async update(id: number, concert: Concert) {
    return await this.concertsRepository.update(id, concert);
  }

  async findOneAndTickets(id: number) {
    const tickets = await this.seatsRepository.find({
      where: {
        concertId: id,
      },
      select: ['seatNumber', 'grade', 'isBooked'],
    });
    return tickets;
  }
}
