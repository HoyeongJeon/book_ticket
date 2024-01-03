import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/concert.dto';
import { ApiOperation } from '@nestjs/swagger';
import { IsAdminGuard } from 'src/common/guards/isAdmin.guard';
import { AccessTokenGuard } from 'src/auth/guard/LoggedIn.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @ApiOperation({ summary: '공연 검색하기(이름, 카테고리)' })
  @Get('search/:keyword')
  search(@Param('keyword') keyword: string) {
    return this.concertsService.search(keyword);
  }

  @ApiOperation({ summary: '새 공연 등록' })
  @Post()
  @UseGuards(AccessTokenGuard, IsAdminGuard)
  @UseInterceptors(FileInterceptor('img_url'))
  async create(
    @Body() createConcertDto: CreateConcertDto,
    @UploadedFile() img_url: Express.Multer.File,
  ) {
    return await this.concertsService.create(
      createConcertDto,
      img_url?.filename,
    );
  }

  @ApiOperation({ summary: '공연 목록 보기' })
  @Get()
  async findAll() {
    return await this.concertsService.findAll();
  }

  @ApiOperation({ summary: '공연 목록 제목만 보기' })
  @Get('name')
  async findAllOnlyName() {
    return await this.concertsService.findAllOnlyName();
  }

  @ApiOperation({ summary: '공연 상세보기' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.concertsService.findOne(id);
  }

  @ApiOperation({ summary: '공연 예약 표 보기' })
  @Get(':id/tickets')
  async findOneAndTickets(@Param('id', ParseIntPipe) id: number) {
    return await this.concertsService.findOneAndTickets(id);
  }
}
