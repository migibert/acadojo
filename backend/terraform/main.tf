resource "google_cloud_run_v2_service" "backend_service" {
  name     = var.service_name
  location = var.gcp_region
  project  = var.gcp_project_id

  template {
    containers {
      image = var.image_name # This image needs to be built and pushed to a registry (e.g., GCR, Artifact Registry)
      ports {
        container_port = 3000 # Default NestJS port, adjust if different
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
    }

    scaling {
      min_instance_count = 0 # Can scale to zero for cost-effectiveness
      max_instance_count = 2 # Example max
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

# Optional: IAM policy to allow unauthenticated invocations (for public API)
# resource "google_cloud_run_service_iam_member" "allow_unauthenticated" {
#   project  = google_cloud_run_v2_service.backend_service.project
#   location = google_cloud_run_v2_service.backend_service.location
#   service  = google_cloud_run_v2_service.backend_service.name
#   role     = "roles/run.invoker"
#   member   = "allUsers"
# }

output "service_url" {
  description = "URL of the deployed Cloud Run service."
  value       = google_cloud_run_v2_service.backend_service.uri
}
