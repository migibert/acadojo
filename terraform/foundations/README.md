# Terraform Foundations Layer

This directory (`terraform/foundations/`) contains the Terraform configurations for the foundational infrastructure of the BJJ Academy project.

## Purpose

The resources managed by this layer are considered core infrastructure components that are prerequisites for deploying the application services. This layer typically changes less frequently than the application code or service configurations.

## Resources Managed

-   **Cloud SQL PostgreSQL Instance**: The primary database instance for the application.
-   **Application Database**: The main database (e.g., `bjj-academy-app-db`) created within the Cloud SQL instance.
-   **Backend Service Account (`backend-sa`)**: An IAM Service Account dedicated to the backend application runtime.
-   **IAM Bindings and SQL User for `backend-sa`**:
    -   Grants the `backend-sa` the `roles/cloudsql.client` permission to connect to the Cloud SQL instance.
    -   Creates a Cloud SQL user corresponding to the `backend-sa` email, enabling IAM database authentication.

## State Management

The Terraform state for this layer is stored remotely in a Google Cloud Storage (GCS) bucket, as configured in `backend.tf`.

## Prerequisites for Applying

-   Terraform CLI installed (version specified in `versions.tf`).
-   Authenticated to Google Cloud with an identity that has permissions to create/manage the resources defined herein (e.g., Cloud SQL Admin, IAM Service Account Admin, Project IAM Admin).
-   A GCS bucket for Terraform remote state must exist and be configured in `backend.tf`.
-   The `gcp_project_id` variable must be set. This can be done by:
    -   Setting the `TF_VAR_gcp_project_id` environment variable.
    -   Creating a `terraform.tfvars` file in this directory with `gcp_project_id = "your-gcp-project-id"`.

## Usage

1.  **Navigate to this directory:**
    ```bash
    cd terraform/foundations
    ```

2.  **Initialize Terraform:**
    ```bash
    terraform init
    ```

3.  **Plan changes:**
    (Ensure `TF_VAR_gcp_project_id` is set or `terraform.tfvars` is present)
    ```bash
    terraform plan
    ```

4.  **Apply changes:**
    ```bash
    terraform apply
    ```

Outputs from this layer (such as database connection name, instance name, and backend service account email) are used by other processes, like the CI/CD pipeline for deploying application services or by developers connecting to the database. Refer to `outputs.tf` for available outputs.

**Important**: After the initial deployment of these foundational resources, a one-time "Database Preparation Script" must be run. This script grants the `backend-sa` the necessary DDL/DCL privileges within the database so it can manage its own schema via TypeORM migrations on application startup. Refer to the main project `README.md` for details on this script.
