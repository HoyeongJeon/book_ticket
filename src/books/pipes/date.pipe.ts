import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const dateString = value;
    const year = Number(dateString.substr(0, 4));
    const month = Number(dateString.substr(5, 2)) - 1; // 월은 0부터 시작하므로 1을 빼줍니다.
    const day = Number(dateString.substr(8, 2));
    const hour = Number(dateString.substr(11, 2));

    const dateObject = new Date(year, month, day, hour);
    return dateObject;
  }
}
