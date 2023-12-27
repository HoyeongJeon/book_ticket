import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/concert.dto';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { IsAdminGuard } from 'src/common/guards/isAdmin.guard';

@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @ApiOperation({ summary: '새 공연 등록' })
  @Post()
  @UseGuards(JwtAuthGuard)
  // IsAdminGuard
  create(@Body() createConcertDto: CreateConcertDto) {
    return this.concertsService.create(createConcertDto);
  }

  @ApiOperation({ summary: '공연 목록 보기' })
  @Get()
  findAll() {
    // return 'Get all Concerts';
    return this.concertsService.findAll();
  }

  @ApiOperation({ summary: '공연 상세보기' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return 'Get Detailed Concert';
    return this.concertsService.findOne(id);
  }
}
