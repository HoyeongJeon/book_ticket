import { BadRequestException, Module, forwardRef } from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { ConcertsController } from './concerts.controller';
import { Concert } from './entities/concert.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Seat } from './entities/seat.entity';
import { ConcertsRepository } from './concerts.repository';
import { Dates } from './entities/dates.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { CONCERT_IMAGE_FOLDER_PATH } from 'src/common/const/file-path.const';
import { v4 } from 'uuid';

@Module({
  exports: [ConcertsService, ConcertsRepository],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Concert, Seat, Dates]),
    AuthModule,
    forwardRef(() => UsersModule),
    MulterModule.register({
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
          return cb(
            new BadRequestException(
              'jpg/jpeg/png 이미지 파일만 업로드 가능합니다.',
            ),
            false,
          );
        }
        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, cb) {
          cb(null, CONCERT_IMAGE_FOLDER_PATH);
        },
        filename: function (req, file, cb) {
          cb(null, `${v4()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [ConcertsController],
  providers: [ConcertsService, ConcertsRepository],
})
export class ConcertsModule {}
