import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './users/user.entity';
import { Academy } from './academies/academy.entity';
import { AcademyUser } from './academies/academy-user.entity';
import { MacroCycle } from './cycles/macro-cycle.entity';
import { MesoCycle } from './cycles/meso-cycle.entity';
import { MicroCycle } from './cycles/micro-cycle.entity';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env file

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'bjj_academy_dev',
  entities: [User, Academy, AcademyUser, MacroCycle, MesoCycle, MicroCycle],
  migrations: [__dirname + '/../db/migrations/*{.ts,.js}'], // Path to migrations
  synchronize: false, // Never use TRUE in production!
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
