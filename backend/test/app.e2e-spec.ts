import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import dataSourcePromise from './../src/data-source'; // Import the promise

// Ensure environment variables for DB connection are set for these tests
// For example, through a .env.test file loaded by dotenv, or set in the test script
// Required: DB_INSTANCE_CONNECTION_NAME, DB_USER_NAME, DB_NAME, GCP_REGION

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let originalDataSource: DataSource; // To store the original data source if needed

  beforeAll(async () => {
    // Resolve the dataSource promise before tests run
    // This ensures that TypeORM is ready and potentially connected via IAM
    originalDataSource = await dataSourcePromise;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    // If AppModule provides DataSource, it might be overridden here if needed,
    // but AppModule should already be using dataSourcePromise.
    // .overrideProvider(DataSource) // Or getDataSourceToken()
    // .useValue(originalDataSource)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (originalDataSource && originalDataSource.isInitialized) {
      await originalDataSource.destroy();
    }
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('Database Connection (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;

  beforeAll(async () => {
    // Ensure environment variables are loaded (e.g. by using dotenv with a .env.test file)
    // For these tests to truly verify IAM, the environment must be configured
    // with credentials that can authenticate to the Cloud SQL instance via IAM.
    // Example required env vars:
    // DB_INSTANCE_CONNECTION_NAME="your-project:your-region:your-instance"
    // DB_USER_NAME="your-iam-db-user" (this is the database user, not the SA email)
    // DB_NAME="your-db-name"
    // GCP_REGION="your-region"

    // Initialize the application and get the DataSource instance
    // The AppModule should be configured to use the dataSourcePromise
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // AppModule should provide DataSource via dataSourcePromise
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Retrieve the DataSource instance from the application context
    // This assumes DataSource is provided and available in the AppModule
    try {
      ds = moduleFixture.get<DataSource>(DataSource);
    } catch (error) {
      // Fallback if DataSource is not directly injectable from AppModule root,
      // try resolving the promise directly. This might mean AppModule isn't
      // correctly set up to use the async dataSourcePromise for its TypeOrmModule.
      // For robust testing, ensure AppModule properly handles the async DataSource.
      console.warn("Could not get DataSource from module, trying direct import. Ensure AppModule handles async DataSource correctly.");
      ds = await dataSourcePromise;
      if (!ds.isInitialized) {
        // If using direct import, it might not have been initialized by NestJS.
        // This is a fallback and indicates potential issues in AppModule's DataSource setup.
        await ds.initialize().catch(err => {
          console.error("Error initializing fallback DataSource:", err);
          throw err; // Propagate error to fail the test setup if direct initialization also fails
        });
      }
    }
  });

  afterAll(async () => {
    if (ds && ds.isInitialized) {
      await ds.destroy();
    }
    await app.close();
  });

  it('should connect to the database (IAM)', async () => {
    expect(ds).toBeDefined();
    // The connection is established when the DataSource is initialized.
    // dataSourcePromise in data-source.ts should handle this.
    // If `beforeAll` completed without throwing, and ds is defined,
    // and AppModule correctly initializes TypeOrmModule.forRootAsync,
    // then the connection should be established.
    expect(ds.isInitialized).toBe(true);
  });

  it('should perform a basic database query (IAM)', async () => {
    expect(ds).toBeDefined();
    expect(ds.isInitialized).toBe(true);

    // Perform a simple query to check connectivity
    const result = await ds.query('SELECT 1 AS result;');
    expect(result).toEqual([{ result: 1 }]);
  });
});
