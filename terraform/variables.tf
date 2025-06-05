variable "gcp_project_id" {
  description = "The GCP project ID to deploy to."
  type        = string
  default     = "your-gcp-project-id" # Placeholder
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

variable "db_instance_name" {
  description = "Name of the Cloud SQL instance."
  type        = string
  default     = "bjj-academy-db-instance"
}

variable "db_name" {
  description = "Name of the database."
  type        = string
  default     = "bjj-academy-db"
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

variable "db_user_name" {
  description = "Name of the database IAM user."
  type        = string
  default     = "bjj-academy-iam-user"
}

variable "backend_service_account_id" {
  description = "The ID of the service account for the backend Cloud Run service."
  type        = string
  default     = "bjj-academy-backend-sa"
}
