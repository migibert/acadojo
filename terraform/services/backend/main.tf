# This file will contain the Cloud Run service definition for the backend application.
# It will consume outputs from the 'foundations' layer via terraform_remote_state.

resource "google_cloud_run_v2_service" "backend_cloud_run_service" {
  name     = var.backend_service_name
  location = var.gcp_region
  project  = var.gcp_project_id

  template {
    service_account = data.terraform_remote_state.foundations.outputs.backend_service_account_email // From foundation

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

      env {
        name  = "DB_INSTANCE_CONNECTION_NAME"
        value = data.terraform_remote_state.foundations.outputs.db_instance_connection_name // From foundation
      }
      env {
        name  = "DB_NAME"
        value = data.terraform_remote_state.foundations.outputs.app_db_name_output // From foundation
      }
      env {
        name  = "DB_USER_NAME" // This is the runtime IAM user for the backend
        value = data.terraform_remote_state.foundations.outputs.backend_service_account_email // From foundation
      }
      env {
        name  = "GCP_REGION" // For cloud-sql-connector if needed explicitly
        value = var.gcp_region
      }
      // Add other necessary environment variables here
      // e.g., NODE_ENV, PORT, etc.
      env {
         name = "NODE_ENV"
         value = "production" // Or parameterize as needed
      }
      env {
         name = "PORT"
         value = "3000" // Or parameterize as needed
      }
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
        container_port = 80 // Default port for frontend served by Nginx or similar
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
