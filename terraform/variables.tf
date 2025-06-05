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
