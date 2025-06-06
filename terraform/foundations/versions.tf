terraform {
  required_version = ">= 1.3" // Use a recent appropriate version

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0" // Or your desired Google provider version
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5" // Or your desired random provider version
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}
