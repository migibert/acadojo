import { MigrationInterface, QueryRunner, Table } from "typeorm";

// IMPORTANT: Replace this with the actual email of your backend's runtime Service Account
// This email is an output from your 'foundations' Terraform layer (backend_service_account_email).
// For development/testing the migration locally, you might use a different user or ensure this SA has local DB access.
// In CI, this should ideally be passed in or known. For now, it's a placeholder.
const APP_RUNTIME_SERVICE_ACCOUNT_EMAIL = "your-backend-sa-email@your-project.iam.gserviceaccount.com"; // Placeholder - REPLACE THIS

export class InitialSchemaAndGrants1670000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // It's good practice to ensure necessary extensions are enabled.
        // However, CREATE EXTENSION often requires superuser privileges beyond what
        // a typical migrations role might have, or what cloudsql.superuser grants.
        // Consider enabling extensions like 'uuid-ossp' or 'pgcrypto' (for gen_random_uuid())
        // at the database instance level or via a one-time manual setup by a true superuser.
        // Example: await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        // For gen_random_uuid(), pgcrypto is often preferred and available by default on many PostgreSQL setups.
        // await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);


        // --- Example: Create an 'users' table ---
        await queryRunner.createTable(
            new Table({
                name: "users", // Replace with your actual table name
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "gen_random_uuid()", // Uses pgcrypto's gen_random_uuid()
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: "created_at",
                        type: "timestamp with time zone",
                        default: "now()",
                        isNullable: false,
                    },
                    {
                        name: "updated_at",
                        type: "timestamp with time zone",
                        default: "now()",
                        isNullable: false,
                    },
                    // TODO: Add other columns for your user entity
                    // Example:
                    // {
                    //     name: "password_hash",
                    //     type: "varchar",
                    //     isNullable: true, // Or false, depending on your auth strategy
                    // },
                ],
            }),
            true, // true to create foreign keys if any are defined in TableColumnOptions[]
        );
        console.log("INFO: 'users' table created (if it didn't exist).");

        // --- Example: Create an 'academies' table ---
        // TODO: Add your other table creations here following the pattern above.
        // Example:
        // await queryRunner.createTable(new Table({
        //    name: "academies",
        //    columns: [
        //        { name: "id", type: "uuid", isPrimary: true, default: "gen_random_uuid()" },
        //        { name: "name", type: "varchar", isNullable: false },
        //        // Add other columns
        //    ]
        // }), true);
        // console.log("INFO: 'academies' table created (if it didn't exist).");


        // --- Grant necessary permissions to the application's runtime IAM user ---
        // This section assumes the tables are created in the 'public' schema (default).
        // Adjust schema name if necessary.

        console.log(`INFO: Granting DML permissions on 'users' table to ${APP_RUNTIME_SERVICE_ACCOUNT_EMAIL}`);
        await queryRunner.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO "${APP_RUNTIME_SERVICE_ACCOUNT_EMAIL}"`);
        // If you use sequences for any tables (not common with UUIDs unless explicitly created), grant usage:
        // Example: await queryRunner.query(`GRANT USAGE, SELECT ON SEQUENCE public.your_table_id_seq TO "${APP_RUNTIME_SERVICE_ACCOUNT_EMAIL}"`);


        // TODO: Add GRANT statements for all other tables your application runtime user needs to access.
        // Example:
        // console.log(`INFO: Granting DML permissions on 'academies' table to ${APP_RUNTIME_SERVICE_ACCOUNT_EMAIL}`);
        // await queryRunner.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.academies TO "${APP_RUNTIME_SERVICE_ACCOUNT_EMAIL}"`);

        console.log("INFO: Permissions granted to application runtime user.");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // --- Revert permissions first (optional, but good practice for thorough down migrations) ---
        // Note: Revoking requires knowing exactly what was granted.
        // For simplicity in many projects, the 'down' migration might just drop objects
        // without fine-grained permission revocation, especially if full data restoration isn't the goal of 'down'.
        console.log(`INFO: Revoking DML permissions on 'users' table from ${APP_RUNTIME_SERVICE_ACCOUNT_EMAIL}`);
        await queryRunner.query(`REVOKE ALL ON TABLE public.users FROM "${APP_RUNTIME_SERVICE_ACCOUNT_EMAIL}"`);
        // TODO: Add REVOKE statements for other tables.
        // Example:
        // console.log(`INFO: Revoking DML permissions on 'academies' table from ${APP_RUNTIME_SERVICE_ACCOUNT_EMAIL}`);
        // await queryRunner.query(`REVOKE ALL ON TABLE public.academies FROM "${APP_RUNTIME_SERVICE_ACCOUNT_EMAIL}"`);


        // --- Drop tables (in reverse order of creation if there are foreign key dependencies) ---
        // TODO: Add drop statements for your other tables here first (e.g., academies before users if users has FK to academies).
        // Example:
        // await queryRunner.dropTable("academies");
        // console.log("INFO: 'academies' table dropped.");

        await queryRunner.dropTable("users");
        console.log("INFO: 'users' table dropped.");

        // TODO: Drop other tables

        // If extensions were created in the 'up' method and are specific to this migration,
        // consider dropping them here. However, extensions are often shared.
        // Example: await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }
}
