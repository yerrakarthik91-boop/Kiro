import 'reflect-metadata';
import { DataSource } from 'typeorm';

// Used by TypeORM CLI (migration:generate / migration:run).
export default new DataSource({
  type: 'postgres',
  url:
    process.env.DATABASE_URL ??
    'postgres://mms:mms_dev_password@localhost:5432/mms',
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
});
