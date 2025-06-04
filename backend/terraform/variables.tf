variable "gcp_project_id" {
  description = "The GCP project ID to deploy to."
  type        = string
  default     = "your-gcp-project-id" # Placeholder
}

variable "gcp_region" {
  description = "The GCP region for resources."
  type        = string
  default     = "us-central1" # Example region
}

variable "service_name" {
  description = "Name of the Cloud Run service."
  type        = string
  default     = "bjj-academy-backend"
}

variable "image_name" {
  description = "The Docker image name for the backend service (e.g., gcr.io/project-id/image-name)."
  type        = string
  default     = "gcr.io/your-gcp-project-id/bjj-academy-backend" # Placeholder
}
