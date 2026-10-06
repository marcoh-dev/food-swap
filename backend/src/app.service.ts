import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

type TableRow = {
  table_name: string;
};

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  async testConnection(): Promise<{ connected: boolean }> {
    try {
      await this.dataSource.query('SELECT 1');

      return {
        connected: true,
      };
    } catch {
      return {
        connected: false,
      };
    }
  }

  async getTables(): Promise<{ tables: string[] }> {
    const result = await this.dataSource.query<TableRow[]>(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

    return {
      tables: result.map((row) => row.table_name),
    };
  }

  getHello(): string {
    return 'Hello from Food Swap Backend!';
  }
}
