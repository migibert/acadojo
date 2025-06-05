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

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
