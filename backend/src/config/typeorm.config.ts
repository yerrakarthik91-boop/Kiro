import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url:
    process.env.DATABASE_URL ??
    'postgres://mms:mms_dev_password@localhost:5432/mms',
  autoLoadEntities: true,
  synchronize: false, // always use migrations
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
  migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
});
