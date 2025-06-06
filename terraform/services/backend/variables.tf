variable "gcp_project_id" {
  description = "GCP Project ID where resources will be deployed."
  type        = string
  # No default - must be provided
}

variable "gcp_region" {
  description = "GCP region for resource deployment."
  type        = string
  default     = "europe-west1"
}

variable "backend_service_name" {
  description = "Name of the Backend Cloud Run service."
  type        = string
  default     = "bjj-academy-backend-service"
}

variable "backend_image_name" {
  description = "The Docker image name for the backend service (e.g., gcr.io/project-id/image-name:tag)."
  type        = string
  # No default - must be provided by CI/CD pipeline
}

variable "frontend_service_name" {
  description = "Name of the Frontend Cloud Run service."
  type        = string
  default     = "bjj-academy-frontend-service"
}

variable "frontend_image_name" {
  description = "The Docker image name for the frontend service (e.g., gcr.io/project-id/image-name:tag)."
  type        = string
  # No default, to be supplied by CI/CD
}
