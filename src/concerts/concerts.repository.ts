import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Concert } from './entities/concert.entity';
import { CreateConcertDto } from './dto/concert.dto';
import { Category } from './entities/category.entity';
import { Dates } from './entities/dates.entity';

@Injectable()
export class ConcertsRepository {
  private concertsRepository: Repository<Concert>;
  private categoryRepository: Repository<Category>;
  private datesRepository: Repository<Dates>;
  constructor(private readonly dataSource: DataSource) {
    this.concertsRepository = this.dataSource.getRepository(Concert);
    this.categoryRepository = this.dataSource.getRepository(Category);
    this.datesRepository = this.dataSource.getRepository(Dates);
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
        price: createConcertDto.price,
        location: createConcertDto.location,
        img_url: createConcertDto.img_url,
        is_booking_open: createConcertDto.is_booking_open,
        seats: createConcertDto.seats,
        category: createConcertDto.category,
      });
      const savedConcert = await this.concertsRepository.save(concert);

      const concertSchedule = dateDtos.map((dateDto) => {
        return this.datesRepository.create({
          date: new Date(dateDto as any),
          concert: savedConcert,
        });
      });
      await this.datesRepository.save(concertSchedule);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.concertsRepository.find({
      relations: ['dates'],
    });
  }
}
