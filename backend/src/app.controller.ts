import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/database/connection')
  testConnection(): any {
    return this.appService.testConnection();
  }

  @Get('/database/tables')
  getTables(): any {
    return this.appService.getTables();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
