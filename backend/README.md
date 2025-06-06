<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Database Configuration for Local Development

This application supports two modes for database authentication, configured via the `DB_AUTH_MODE` environment variable. This is primarily to facilitate local development against a standard PostgreSQL instance while using IAM-based authentication in deployed environments (like Cloud Run).

### Authentication Modes

1.  **IAM Authentication (Default)**
    *   If `DB_AUTH_MODE` is **not set** or set to any value other than `STANDARD`, the application will attempt to use IAM-based authentication.
    *   This is the default mode for deployed environments.
    *   **For Deployed Environments (e.g., Cloud Run):**
        *   `DB_INSTANCE_CONNECTION_NAME`: The Cloud SQL instance connection name (e.g., `your-project:your-region:your-instance`). This is configured in Terraform.
        *   `DB_USER_NAME`: For deployed services, this is **automatically set to the service account email** of the Cloud Run service itself (e.g., `your-backend-sa@your-project.iam.gserviceaccount.com`). This is configured in Terraform and usually not overridden for the deployed service.
        *   `DB_NAME`: The name of the database (e.g., `bjj_academy_app_db`). This is configured in Terraform.
        *   `GCP_REGION`: The GCP region where the Cloud SQL instance is located (e.g., `europe-west1`).
    *   **For Local Development using IAM against a Cloud SQL instance:**
        *   Set `DB_AUTH_MODE` to any value other than `STANDARD` (or leave it unset).
        *   `DB_INSTANCE_CONNECTION_NAME`: As above.
        *   `DB_USER_NAME`: **Must be set to your personal Google IAM user email** (e.g., `developer.email@example.com`).
            *   Your IAM user must be granted the `roles/cloudsql.client` permission in the GCP project.
            *   A Cloud SQL IAM user must be created for your email: `gcloud sql users create developer.email@example.com --instance=INSTANCE_NAME --type=CLOUD_IAM_USER`.
        *   `DB_NAME`: As above.
        *   `GCP_REGION`: As above.
        *   Ensure you are authenticated with GCP Application Default Credentials (e.g., by running `gcloud auth application-default login`).

2.  **Standard Username/Password Authentication**
    *   To use standard username and password authentication (e.g., for a local Dockerized PostgreSQL instance), set `DB_AUTH_MODE=STANDARD`.
    *   Required environment variables for `STANDARD` mode:
        *   `DB_HOST`: The hostname of the database server (e.g., `localhost`).
        *   `DB_PORT`: The port number of the database server (e.g., `5432`).
        *   `DB_USER_NAME`: The database username (e.g., `postgres`). (Note: if `DB_AUTH_MODE=STANDARD` is set, this `DB_USER_NAME` is used, not an IAM email).
        *   `DB_PASSWORD`: The password for the database username.
        *   `DB_NAME`: The name of the database (e.g., `bjj_academy_dev`).

### A Note on Terraform Variables

The infrastructure for this backend (including Cloud SQL instance and user setup for deployed environments) is managed by Terraform. Key points regarding recent changes:
-   The Terraform variable `db_user_name` (previously for setting a custom IAM user name) has been removed. The deployed service now uses its own service account email as the database IAM user, configured directly in Terraform.
-   Terraform variables `db_instance_name_prefix` (for the Cloud SQL instance name, with a random suffix added) and `db_name` (for the database name) now have sensible defaults in `terraform/variables.tf`. These typically do not need to be overridden via CI/CD environment variables for the primary deployment.

### Database Migrations

Database schema changes are managed using TypeORM migrations. Migration files are located in the `backend/db/migrations/` directory.

**Creating Migrations:**
To generate a new migration file, use the following npm script from the `backend` directory:
```bash
npm run migration:generate --name=YourDescriptiveMigrationName
```
This will create a new timestamped migration file in `backend/db/migrations/`. You then need to edit this file to add your schema changes (using `queryRunner.query(...)` or TypeORM's schema builder methods) and logic for reverting them in the `down` method.

**How Migrations Are Applied:**
-   The backend application is configured with `migrationsRun: true` in its TypeORM `DataSourceOptions` (see `src/data-source.ts`).
-   This means **pending migrations are automatically run by the application itself every time it starts up.**
-   For this to work, the application's runtime IAM Service Account (`backend-sa`, whose email is set as `DB_USER_NAME` when `DB_AUTH_MODE` is IAM) must have sufficient DDL/DCL permissions on the database. These permissions are intended to be granted by the **"One-Time Database Preparation Script"** detailed in the root `README.md`.
-   **Permissions within Migrations:** Migration scripts (especially initial ones) should still `GRANT` necessary DML permissions (`SELECT, INSERT, UPDATE, DELETE`) on created tables/objects to the `backend-sa`'s SQL user. This ensures the application can use the schema it defines/modifies.

### Running Migrations Locally (for Development & Testing)

While migrations run automatically in deployed environments, you might need to run them manually during local development (e.g., after generating a new one or to test).

**1. Against a Local Dockerized PostgreSQL (Standard Authentication):**
   - Ensure your local PostgreSQL container is running.
   - Set up your `.env` file with `DB_AUTH_MODE=STANDARD` and the correct `DB_HOST`, `DB_PORT`, `DB_USER_NAME`, `DB_PASSWORD`, and `DB_NAME`. The `DB_USER_NAME` for this local setup (e.g., `postgres`) should have privileges to alter the schema on your local database.
   - Navigate to the `backend` directory and run:
     ```bash
     npm run migration:run
     ```
     You can also use `migration:revert` if needed.

**2. Against a Cloud SQL Instance (using IAM for `backend-sa`):**
   This scenario is for testing your migrations against a Cloud SQL database, using the same IAM user (`backend-sa`) that the deployed application uses.
   - **Prerequisites**: The "One-Time Database Preparation Script" must have been run for your Cloud SQL instance, granting DDL/DCL rights to the `backend-sa`'s SQL user.
   - **Authentication**: You need to impersonate the `backend-sa` service account.
     ```bash
     gcloud auth application-default login --impersonate-service-account=<backend_sa_email_from_terraform_outputs>
     ```
     (Replace `<backend_sa_email_...>` with the actual email from `foundations` Terraform output `backend_service_account_email`). Your personal GCP account needs the "Service Account Token Creator" role on the `backend-sa`.
   - **Environment Variables for TypeORM CLI**:
     - Ensure `DB_AUTH_MODE` is **not** set to `STANDARD` (or is unset) in your environment/`.env` file.
     - Set `DB_INSTANCE_CONNECTION_NAME` to your Cloud SQL instance's connection name.
     - Set `DB_NAME` to the target database name.
     - Set `DB_USER_NAME` to the `backend-sa` service account email (the one you are impersonating).
     - Set `GCP_REGION` if needed by the Cloud SQL connector.
   - **Run Migrations CLI Commands**:
     Navigate to the `backend` directory and run:
     ```bash
     npm run migration:run
     # Or other commands like migration:revert, migration:show
     ```

### Example `.env` file for Local Development (Standard Auth)

Create a `.env` file in the `backend` directory root for local development:

```env
# .env file for backend local development

# Database Configuration
DB_AUTH_MODE=STANDARD
DB_HOST=localhost
DB_PORT=5432
DB_USER_NAME=your_local_db_user
DB_PASSWORD=your_local_db_password
DB_NAME=your_local_db_name

# Other environment variables if needed by your application
# For example, if running the NestJS app on a different port:
# PORT=3001
```

**Note:** Ensure your local PostgreSQL instance is running and accessible with the credentials provided. The `.env` file is typically loaded by `dotenv` (which is included in `data-source.ts`). Remember to add `.env` to your `.gitignore` file to avoid committing credentials.

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
