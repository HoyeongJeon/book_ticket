import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/http.exception-filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('티켓 예매 사이트')
    .setDescription('티켓 예매 사이트에 대한 API 서버')
    .setVersion('1.0')
    .addTag('tickets')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
bootstrap();
