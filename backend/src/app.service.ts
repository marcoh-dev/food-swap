import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type TableInfoRow = {
  table_name: string;
  columns: {
    name: string;
    data_type: string;
    nullable: boolean;
  }[];
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
  async getTables(): Promise<{ tables: TableInfoRow[] }> {
    const result = await this.dataSource.query<TableInfoRow[]>(`
    SELECT
      t.table_name,
      COALESCE(
        json_agg(
          json_build_object(
            'name', c.column_name,
            'data_type', c.data_type,
            'nullable', c.is_nullable = 'YES'
          )
          ORDER BY c.ordinal_position
        ) FILTER (WHERE c.column_name IS NOT NULL),
        '[]'
      ) AS columns
    FROM information_schema.tables t
    LEFT JOIN information_schema.columns c
      ON c.table_schema = t.table_schema
      AND c.table_name = t.table_name
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
    GROUP BY t.table_name
    ORDER BY t.table_name;
  `);

    return { tables: result };
  }

  getHello(): string {
    return 'Hello from Food Swap Backend!';
  }
}
