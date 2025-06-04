terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  # Configuration options for the provider, e.g., project, region
  # These will typically be configured via environment variables or a backend config
  # For now, we'll leave them to be implicitly configured or use TF_VAR_ environment variables
  # project = var.gcp_project_id
  # region  = var.gcp_region
}
