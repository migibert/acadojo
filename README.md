# Acadojo

Acadojo is a SaaS platform for BJJ academies.

## Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Yarn](https://yarnpkg.com/) (v1 or v2)
- [Docker](https://www.docker.com/get-started) (for running a local database)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/migibert/acadojo.git
    cd acadojo
    ```

2.  **Install dependencies:**
    Run the following command from the root of the project to install dependencies for both the frontend and backend workspaces:
    ```bash
    yarn install
    ```
    Or simply:
    ```bash
    yarn
    ```

## Database Setup (Local Development)

For local development, the backend expects a PostgreSQL database. You can run one using Docker.

1.  **Start a PostgreSQL container:**
    Run the following command in your terminal. This will start a PostgreSQL container named `acadojo-postgres`, set up the necessary user, password, and database, and map it to port `5432` on your local machine.
    ```bash
    docker run --name acadojo-postgres \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=bjj_academy_dev \
      -p 5432:5432 \
      -d postgres
    ```
    The backend is configured by default to connect to this database (user: `postgres`, password: `postgres`, database: `bjj_academy_dev`, host: `localhost`, port: `5432`).

2.  **Database Migrations:**
    Once the database container is running, you'll need to apply the database migrations. The backend uses TypeORM for database management.
    To run migrations, navigate to the `backend` directory and use the migration script defined in `backend/package.json`:
    ```bash
    cd backend
    yarn migration:run
    cd ..
    ```
    *Note: Ensure the backend dependencies are installed (`yarn install` from the root) before running migrations.*

## Running the application

You'll need to run the backend and frontend in separate terminals. Make sure your database is running and migrations are applied before starting the backend.

### Backend

To start the backend development server:
```bash
yarn dev:backend
```
This will start the NestJS backend, typically available at `http://localhost:3000`.

### Frontend

To start the frontend development server:
```bash
yarn dev:frontend
```
This will start the Vite React frontend, typically available at `http://localhost:5173`.

## Running tests

To run tests for both frontend and backend:
```bash
yarn test
```

## Linting

To lint the codebase for both frontend and backend:
```bash
yarn lint
```

## Infrastructure as Code (Terraform)

The infrastructure for this project is managed using Terraform, primarily within the `terraform/foundations/` directory. This layer is responsible for provisioning:
*   Cloud SQL PostgreSQL instance.
*   The application database within the instance.
*   The primary IAM Service Account for the backend application's runtime (`backend-sa`).
*   The necessary IAM bindings to allow the `backend-sa` to connect to the Cloud SQL instance as an IAM database user.

The state for this `foundations` layer is stored in a Google Cloud Storage (GCS) bucket. Key variables, such as `gcp_project_id`, must be configured for Terraform to run (typically via environment variables or `.tfvars` files in local/CI environments).

Cloud Run services (frontend and backend) are **not** managed by Terraform in this project. They are deployed directly using `gcloud` CLI commands within the CI/CD pipeline.

## CI/CD Pipeline Overview

The project uses GitHub Actions for Continuous Integration and Continuous Deployment, defined in `.github/workflows/ci.yml`. The main deployment workflow (`build-and-deploy` job) consists of the following stages:

1.  **Lint, Test, and Build**: Code is linted, tests are run, and the backend/frontend applications are built.
2.  **Docker Image Builds**: Docker images are built for the frontend and backend applications and pushed to Google Container Registry (GCR). Image names are tagged with the commit SHA.
3.  **Terraform Apply `foundations` Layer**: The foundational infrastructure (Cloud SQL, `backend-sa`, etc.) is applied or updated using Terraform. This step might be conditional or run less frequently, as these resources typically change less often than application code.
4.  **`gcloud run deploy` for Backend Service**: The backend Cloud Run service is deployed using the Docker image built earlier. It connects to the database using the `backend-sa` identity and IAM database authentication. **On startup, the backend application automatically runs its own database schema migrations** (managed by TypeORM).
5.  **`gcloud run deploy` for Frontend Service**: The frontend Cloud Run service is deployed using its Docker image.

This pipeline ensures that foundational infrastructure is managed by Terraform, while application deployments are handled by `gcloud` CLI commands, with the backend application managing its own database schema evolution.

## One-Time Database Preparation Script

After the foundational infrastructure (Cloud SQL instance, application database, and the `backend-sa` service account with its SQL/IAM user) is deployed by Terraform (`terraform/foundations/`), a one-time preparatory script needs to be run manually or semi-automatically. This script's purpose is to grant the necessary DDL (Data Definition Language) and DCL (Data Control Language) privileges to the `backend-sa`'s SQL user (`<backend_sa_email>`) so that the backend application can manage its own schema via TypeORM migrations on startup.

**This script is NOT part of the automated CI/CD application deployment pipeline. It should be run:**
*   Once after the initial setup of the database.
*   Potentially again if global database permissions need fundamental changes (rare).

**Script Responsibilities (Outline):**

The script should perform the following actions:

1.  **Prerequisites:**
    *   Ensure `gcloud` CLI is installed and authenticated with an identity that has permissions to:
        *   List and create Cloud SQL users for the target instance.
        *   Delete Cloud SQL users for the target instance.
    *   Ensure `psql` (PostgreSQL client) is installed.
    *   Ensure Cloud SQL Proxy is available or that the execution environment has an authorized network connection to the Cloud SQL instance.
    *   The script operator must have access to the **password for the `postgres` superuser** of the Cloud SQL instance (this password was set when the instance was created or last managed).

2.  **Inputs Required by the Script:**
    *   `GCP_PROJECT_ID`: Your Google Cloud Project ID.
    *   `CLOUD_SQL_INSTANCE_NAME`: The name of your Cloud SQL instance (e.g., from `terraform output cloud_sql_instance_name` in the `foundations` layer).
    *   `APP_DATABASE_NAME`: The name of the application database (e.g., from `terraform output app_db_name_output` in the `foundations` layer).
    *   `BACKEND_SA_EMAIL`: The email of the backend's runtime service account (from `terraform output backend_service_account_email` in the `foundations` layer).
    *   `POSTGRES_SUPERUSER_PASSWORD`: The password for the `postgres` user of the Cloud SQL instance.

3.  **Script Workflow:**
    *   **Generate Temporary Admin User Credentials:**
        *   Create a strong, random password for a temporary SQL user (e.g., `temp_prep_admin`).
    *   **Create Temporary Admin SQL User via `gcloud`:**
        *   `gcloud sql users create temp_prep_admin --instance=${CLOUD_SQL_INSTANCE_NAME} --project=${GCP_PROJECT_ID} --password=<generated_random_password>`
    *   **Elevate Privileges of Temporary Admin User:**
        *   Establish a connection to the `${APP_DATABASE_NAME}` on `${CLOUD_SQL_INSTANCE_NAME}` as the `postgres` user (using the `${POSTGRES_SUPERUSER_PASSWORD}`). This typically involves starting Cloud SQL Proxy.
        *   Execute SQL: `ALTER USER "temp_prep_admin" WITH SUPERUSER;`
          *(Note: Ensure "temp_prep_admin" is correctly quoted if it contains special characters, though it's best to generate names that don't require quoting if possible).*
        *   Close this connection.
    *   **Grant Permissions to Backend SA's SQL User:**
        *   Establish a new connection to the `${APP_DATABASE_NAME}` as the now-superuser `temp_prep_admin` (using its generated random password). This also typically involves Cloud SQL Proxy.
        *   Execute the following SQL commands (adjust schema name from `public` if necessary):
          ```sql
          -- Grant permissions on the schema itself
          GRANT CREATE ON SCHEMA public TO "${BACKEND_SA_EMAIL}";
          GRANT USAGE ON SCHEMA public TO "${BACKEND_SA_EMAIL}";

          -- Grant DML permissions on existing tables (if any) and future tables in this schema
          ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${BACKEND_SA_EMAIL}";
          GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "${BACKEND_SA_EMAIL}"; -- For existing tables

          -- Grant permissions for sequences (if using serial types for IDs)
          ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO "${BACKEND_SA_EMAIL}";
          GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "${BACKEND_SA_EMAIL}"; -- For existing sequences
          ```
        *   Close this connection.
    *   **Delete Temporary Admin SQL User via `gcloud`:**
        *   `gcloud sql users delete temp_prep_admin --instance=${CLOUD_SQL_INSTANCE_NAME} --project=${GCP_PROJECT_ID}`
    *   **Clean up Cloud SQL Proxy if started by the script.**

**Security Note:** This script handles the `postgres` superuser password. Ensure it is handled securely (e.g., prompted for, read from a secure environment variable, not hardcoded or logged). The temporary user's password is less critical as the user is short-lived.

---
*(You will be responsible for creating the actual script (e.g., Bash, Python) that implements this logic.)*

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
