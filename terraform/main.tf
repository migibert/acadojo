resource "google_cloud_run_v2_service" "backend_cloud_run_service" {
  name     = var.backend_service_name
  location = var.gcp_region
  project  = var.gcp_project_id

  template {
    containers {
      image = var.backend_image_name
      ports {
        container_port = 3000 // Default NestJS port
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

resource "google_cloud_run_v2_service" "frontend_cloud_run_service" {
  name     = var.frontend_service_name
  location = var.gcp_region
  project  = var.gcp_project_id

  template {
    containers {
      image = var.frontend_image_name
      ports {
        container_port = 80 // Default port for frontend served by Nginx
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

# Optional: IAM policy to allow unauthenticated invocations
# This can be applied to both services if needed.
# resource "google_cloud_run_service_iam_member" "allow_unauthenticated_backend" {
#   project  = google_cloud_run_v2_service.backend_cloud_run_service.project
#   location = google_cloud_run_v2_service.backend_cloud_run_service.location
#   service  = google_cloud_run_v2_service.backend_cloud_run_service.name
#   role     = "roles/run.invoker"
#   member   = "allUsers"
# }

# resource "google_cloud_run_service_iam_member" "allow_unauthenticated_frontend" {
#   project  = google_cloud_run_v2_service.frontend_cloud_run_service.project
#   location = google_cloud_run_v2_service.frontend_cloud_run_service.location
#   service  = google_cloud_run_v2_service.frontend_cloud_run_service.name
#   role     = "roles/run.invoker"
#   member   = "allUsers"
# }

output "backend_cloud_run_service_name" {
  description = "Name of the deployed Backend Cloud Run service."
  value       = google_cloud_run_v2_service.backend_cloud_run_service.name
}

output "frontend_cloud_run_service_name" {
  description = "Name of the deployed Frontend Cloud Run service."
  value       = google_cloud_run_v2_service.frontend_cloud_run_service.name
}
