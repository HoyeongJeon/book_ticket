import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateConcertDto } from './dto/concert.dto';
import { ConcertsRepository } from './concerts.repository';
import { Concert } from './entities/concert.entity';

@Injectable()
export class ConcertsService {
  constructor(private readonly concertsRepository: ConcertsRepository) {}
  async create(createConcertDto: CreateConcertDto, img_url: string) {
    const concert = await this.concertsRepository.create(
      createConcertDto,
      img_url,
    );
    return concert;
  }

  async findAll() {
    const concerts = await this.concertsRepository.findAll();
    return concerts;
  }

  async findAllOnlyName() {
    const concertsNames = await this.concertsRepository.findAllOnlyName();
    return concertsNames;
  }

  async findOne(id: number) {
    const concert = await this.concertsRepository.findOne(id);
    if (!concert) {
      throw new BadRequestException('존재하지 않는 공연입니다.');
    }
    return concert;
  }

  async search(keyword: string) {
    const results = await this.concertsRepository.search(keyword);
    if (results.length === 0) {
      return '검색 결과가 존재하지 않습니다.';
    }
    return results;
  }

  async update(id: number, concert: Concert) {
    const existingConcert = await this.concertsRepository.findOne(id);
    if (!existingConcert) {
      throw new BadRequestException('존재하지 않는 공연입니다.');
    }
    const updatedConcert = await this.concertsRepository.update(id, concert);
    return updatedConcert;
  }

  async findOneAndTickets(id: number) {
    return await this.concertsRepository.findOneAndTickets(id);
  }
}
