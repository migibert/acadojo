variable "gcp_project_id" {
  description = "GCP Project ID where resources will be deployed."
  type        = string
  # No default - must be provided.
}

variable "gcp_region" {
  description = "GCP region for resource deployment."
  type        = string
  default     = "europe-west1"
}

variable "db_instance_name_prefix" {
  description = "Prefix for the Cloud SQL database instance name. A random suffix will be appended."
  type        = string
  default     = "bjj-academy-instance"
}

variable "app_db_name" {
  description = "Name of the main application database."
  type        = string
  default     = "bjj-academy-app-db"
}

variable "backend_service_account_id" {
  description = "The ID for the backend service account."
  type        = string
  default     = "bjj-academy-backend-sa"
}

# Removed migrations_service_account_id variable
# Removed db_migrations_user_name and db_migrations_user_password variables (already done in previous step, comment retained for clarity)
