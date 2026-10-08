import { Controller, Get } from '@nestjs/common';
import { AppService, TableInfoRow } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('/database/connection')
  testConnection(): Promise<{ connected: boolean }> {
    return this.appService.testConnection();
  }

  @Public()
  @Get('/database/tables')
  getTables(): Promise<{ tables: TableInfoRow[] }> {
    return this.appService.getTables();
  }

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
