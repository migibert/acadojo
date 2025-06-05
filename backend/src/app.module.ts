import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDataSourceOptions } from './data-source'; // Updated import
import { AppService } from './app.service';
import { DataSource, DataSourceOptions } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const options = await getDataSourceOptions();
        return options;
      },
      // Optional: if you want to inject the DataSource itself after it's created by TypeORM
      // based on the options from useFactory. This is useful if other modules need to
      // inject the DataSource directly.
      // dataSourceFactory: async (options?: DataSourceOptions) => {
      //   if (!options) {
      //     throw new Error('DataSourceOptions is undefined in dataSourceFactory');
      //   }
      //   // The options from useFactory are passed here.
      //   // TypeORM will internally create a DataSource with these options.
      //   // If you need to return a pre-existing DataSource instance (like `dataSourcePromise`),
      //   // that's a more complex setup often involving custom providers.
      //   // For most cases, returning options from useFactory is sufficient.
      //   // The `dataSourcePromise` from data-source.ts initializes a DataSource instance
      //   // independently. If you want NestJS to manage *that specific instance*,
      //   // you'd typically provide it directly.
      //   // However, the standard forRootAsync is to provide options.
      //   // Let's stick to providing options from getDataSourceOptions.
      //   //
      //   // If you were to use the dataSourcePromise directly:
      //   // return await dataSourcePromise; // This would mean dataSourcePromise should resolve to DataSourceOptions
      //   // or that dataSourceFactory can return an already initialized DataSource.
      //   // The TypeORM documentation suggests dataSourceFactory returns an initialized DataSource.
      //   // Let's try aligning with that if direct instance usage is preferred.
      //   //
      //   // Re-evaluating: getDataSourceOptions() returns DataSourceOptions.
      //   // dataSourcePromise from data-source.ts resolves to an initialized DataSource.
      //   // The simplest for NestJS is to let it create the DataSource from options.
      //   // If we want to ensure the *exact same instance* from dataSourcePromise is used
      //   // everywhere, we'd need a custom provider for DataSource.
      //   // For now, let's assume letting TypeOrmModule create it from options is fine.
      //   // This means there might be two DataSource instances if dataSourcePromise is also used directly elsewhere.
      //   // To avoid this, one could do:
      //   //
      //   // imports: [
      //   //   TypeOrmModule.forRootAsync({
      //   //     useFactory: async () => await getDataSourceOptions(),
      //   //     dataSourceFactory: async (options) => {
      //   //        const ds = new DataSource(options); // TypeORM creates this
      //   //        return ds; // This is what TypeORM does internally mostly
      //   //     }
      //   //   }),
      //   // ],
      //   //
      //   // The most straightforward way given `getDataSourceOptions` returns `Promise<DataSourceOptions>`:
      //   return options; // This is correct for useFactory
      // }
      // Let's remove dataSourceFactory for now to keep it standard, useFactory provides the options.
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
