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
  const dbAuthMode = process.env.DB_AUTH_MODE;
  const dbUser = process.env.DB_USER_NAME;
  const dbName = process.env.DB_NAME;

  const baseOptions = {
    type: 'postgres',
    entities: [User, Academy, AcademyUser, MacroCycle, MesoCycle, MicroCycle],
    migrations: [__dirname + '/../db/migrations/*{.ts,.js}'],
    synchronize: false, // Never use TRUE in production!
    logging: true,
  };

  if (dbAuthMode === 'STANDARD') {
    // Standard username/password authentication
    const dbHost = process.env.DB_HOST;
    const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
    const dbPassword = process.env.DB_PASSWORD;

    if (!dbHost || !dbUser || !dbPassword || !dbName) {
      throw new Error(
        'For STANDARD auth mode, DB_HOST, DB_USER_NAME, DB_PASSWORD, and DB_NAME must be set.'
      );
    }

    return {
      ...baseOptions,
      host: dbHost,
      port: dbPort,
      username: dbUser,
      password: dbPassword,
      database: dbName,
    };
  } else {
    // Default to IAM authentication
    const connector = new Connector();
    const dbInstanceConnectionName = process.env.DB_INSTANCE_CONNECTION_NAME;
    const gcpRegion = process.env.GCP_REGION; // GCP_REGION is used by the connector implicitly via ADC or env

    if (!dbInstanceConnectionName || !dbUser || !dbName) {
      throw new Error(
        'For IAM auth mode, DB_INSTANCE_CONNECTION_NAME, DB_USER_NAME (IAM user), and DB_NAME must be set.'
      );
    }
     // GCP_REGION might also be important for the connector, ensure it's available if needed.
    if (!gcpRegion) {
      console.warn('GCP_REGION is not set; IAM authentication might rely on default settings or fail if region is ambiguous.');
    }


    const clientOpts = await connector.getOptions({
      instanceConnectionName: dbInstanceConnectionName,
      ipType: IpAddressTypes.PUBLIC, // Or PRIVATE, depending on your setup
      authType: 'IAM',
      // The connector uses the DB_USER_NAME as the IAM user for token generation if authType is 'IAM'.
      // It does not explicitly take 'username' in getOptions for IAM auth type,
      // but TypeORM still needs it in the final options.
    });

    return {
      ...baseOptions,
      ...clientOpts, // Spreads host, port, ssl context from connector
      username: dbUser, // This should be the IAM database user
      database: dbName,
      // Password is not set here as clientOpts from connector provides SSL context for IAM
    };
  }
};

// Initialize dataSource asynchronously
const initializeDataSource = async () => {
  const options = await getDataSourceOptions();
  return new DataSource(options);
};

// Export a promise that resolves to the DataSource instance
const dataSourcePromise = initializeDataSource();
export default dataSourcePromise;
