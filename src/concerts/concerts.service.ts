import { Injectable } from '@nestjs/common';
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

  findOne(id: number) {
    return `This action returns a #${id} concert`;
  }
}
