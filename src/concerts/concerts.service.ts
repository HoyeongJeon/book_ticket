import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateConcertDto } from './dto/concert.dto';
import { ConcertsRepository } from './concerts.repository';

@Injectable()
export class ConcertsService {
  constructor(private readonly concertsRepository: ConcertsRepository) {}
  async create(createConcertDto: CreateConcertDto) {
    const concert = await this.concertsRepository.create(createConcertDto);
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
}
