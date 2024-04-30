import { Injectable } from '@nestjs/common';

import { Columns } from 'src/entities/column.entity';
import { Model } from 'src/entities/model.entity';

import * as handleBars from 'handlebars';

@Injectable()
export class MainGenService {
  private mainHandler =
    handleBars.compile(`import { NestFactory } from '@nestjs/core';
  import { ValidationPipe } from '@nestjs/common';
  
  import { AppModule } from './app.module';
  import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
  
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
  
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
    const config = new DocumentBuilder()
      .setTitle('YOUR TITLE')
      .setDescription(
        'YOUR DESCRIPTION',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  
    await app.listen(3000);
  }
  bootstrap();
  `);

  async generateOutPut() {
    return this.mainHandler({});
  }
}
