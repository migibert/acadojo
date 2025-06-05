variable "gcp_project_id" {
  description = "The GCP project ID to deploy to. This variable must be explicitly set."
  type        = string
  # No default value - should be provided via .tfvars, environment variables, or CI/CD pipeline.
}

variable "gcp_region" {
  description = "The GCP region for resources."
  type        = string
  default     = "europe-west1" # Updated region
}

variable "backend_service_name" {
  description = "Name of the Backend Cloud Run service."
  type        = string
  default     = "bjj-academy-backend-service"
}

variable "backend_image_name" {
  description = "The Docker image name for the backend service (e.g., gcr.io/project-id/image-name)."
  type        = string
  default     = "gcr.io/your-gcp-project-id/bjj-academy-backend" # Placeholder
}

variable "frontend_service_name" {
  description = "Name of the Frontend Cloud Run service."
  type        = string
  default     = "bjj-academy-frontend-service"
}

variable "frontend_image_name" {
  description = "The Docker image name for the frontend service (e.g., gcr.io/project-id/image-name)."
  type        = string
  default     = "gcr.io/your-gcp-project-id/bjj-academy-frontend" # Placeholder
}

variable "db_instance_name_prefix" {
  description = "Prefix for the Cloud SQL database instance name. A random suffix will be appended."
  type        = string
  default     = "bjj-academy-instance"
}

variable "db_name" {
  description = "Name of the main application database."
  type        = string
  default     = "bjj-academy-app-db" # Changed default
}

variable "db_version" {
  description = "Version of the PostgreSQL database."
  type        = string
  default     = "POSTGRES_15"
}

variable "db_tier" {
  description = "Tier of the Cloud SQL instance."
  type        = string
  default     = "db-f1-micro"
}

variable "db_deletion_protection" {
  description = "Enable deletion protection for the Cloud SQL instance."
  type        = bool
  default     = false # Set to true for production environments
}

# The db_user_name variable block is removed by this change.

variable "backend_service_account_id" {
  description = "The ID of the service account for the backend Cloud Run service."
  type        = string
  default     = "bjj-academy-backend-sa"
}
