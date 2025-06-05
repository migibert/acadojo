import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './users/user.entity';
import { Academy } from './academies/academy.entity';
import { AcademyUser } from './academies/academy-user.entity';
import { MacroCycle } from './cycles/macro-cycle.entity';
import { MesoCycle } from './cycles/meso-cycle.entity';
import { MicroCycle } from './cycles/micro-cycle.entity';
import * as dotenv from 'dotenv';
import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';

dotenv.config(); // Load .env file

export const getDataSourceOptions = async (): Promise<DataSourceOptions> => {
  const connector = new Connector();

  // Ensure critical environment variables are set
  const dbInstanceConnectionName = process.env.DB_INSTANCE_CONNECTION_NAME; // e.g., your-project:your-region:your-instance
  const dbUser = process.env.DB_USER_NAME; // IAM user, e.g. bjj-academy-iam-user
  const dbName = process.env.DB_NAME; // e.g. bjj-academy-db

  if (!dbInstanceConnectionName || !dbUser || !dbName) {
    throw new Error(
      'DB_INSTANCE_CONNECTION_NAME, DB_USER_NAME, and DB_NAME must be set in the environment for IAM authentication.'
    );
  }

  const clientOpts = await connector.getOptions({
    instanceConnectionName: dbInstanceConnectionName,
    ipType: IpAddressTypes.PUBLIC, // Or PRIVATE, depending on your setup
    authType: 'IAM',
  });

  return {
    type: 'postgres',
    ...clientOpts, // Spread the connector options (host, port, etc.)
    username: dbUser, // IAM database user
    database: dbName,
    entities: [User, Academy, AcademyUser, MacroCycle, MesoCycle, MicroCycle],
    migrations: [__dirname + '/../db/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: true,
    // Note: 'password' is not needed here as IAM auth is handled by the connector's SSL context
  };
};

// Initialize dataSource asynchronously
const initializeDataSource = async () => {
  const options = await getDataSourceOptions();
  return new DataSource(options);
};

// Export a promise that resolves to the DataSource instance
const dataSourcePromise = initializeDataSource();
export default dataSourcePromise;
