resource "google_cloud_run_v2_service" "backend_cloud_run_service" {
  name     = var.backend_service_name
  location = var.gcp_region
  project  = var.gcp_project_id

  template {
    service_account = google_service_account.backend_sa.email
    containers {
      image = var.backend_image_name
      ports {
        container_port = 3000 // Default NestJS port
      }
      env {
        name  = "DB_INSTANCE_CONNECTION_NAME"
        value = google_sql_database_instance.default.connection_name
      }
      env {
        name  = "DB_USER_NAME"
        value = google_service_account.backend_sa.email # Use SA email for DB IAM user
      }
      env {
        name  = "DB_NAME"
        value = google_sql_database.default.name
      }
      env {
        name = "GCP_REGION" # Pass region, might be needed by pg-iam-auth or connector
        value = var.gcp_region
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

# Service Account for Backend Cloud Run
resource "google_service_account" "backend_sa" {
  account_id   = var.backend_service_account_id
  display_name = "Backend Cloud Run Service Account"
  project      = var.gcp_project_id
}

# Grant Cloud SQL Client role to the backend service account
resource "google_project_iam_member" "backend_sa_sql_client" {
  project = var.gcp_project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
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

resource "random_id" "db_instance_name_suffix" {
  byte_length = 4
}

resource "google_sql_database_instance" "default" {
  name             = "${var.db_instance_name}-${random_id.db_instance_name_suffix.hex}"
  region           = var.gcp_region
  project          = var.gcp_project_id
  database_version = var.db_version
  settings {
    tier    = var.db_tier
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        value           = "0.0.0.0/0" # Allows access from any IP, adjust as needed for security
        name            = "Allow all"
      }
    }
    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "on"
    }
  }
  deletion_protection = var.db_deletion_protection
}

resource "google_sql_database" "default" {
  name     = var.db_name
  instance = google_sql_database_instance.default.name
  project  = var.gcp_project_id
}

resource "google_sql_user" "iam_user" {
  name     = google_service_account.backend_sa.email # Use the backend service account email
  instance = google_sql_database_instance.default.name
  project  = var.gcp_project_id
  type     = "CLOUD_IAM_SERVICE_ACCOUNT" # Type must be this for SA email
}

output "backend_cloud_run_service_name" {
  description = "Name of the deployed Backend Cloud Run service."
  value       = google_cloud_run_v2_service.backend_cloud_run_service.name
}

output "frontend_cloud_run_service_name" {
  description = "Name of the deployed Frontend Cloud Run service."
  value       = google_cloud_run_v2_service.frontend_cloud_run_service.name
}

output "db_instance_connection_name" {
  description = "The connection name of the Cloud SQL instance."
  value       = google_sql_database_instance.default.connection_name
}

output "db_instance_name" {
  description = "The name of the Cloud SQL instance."
  value       = google_sql_database_instance.default.name
}

output "db_name" {
  description = "The name of the database."
  value       = google_sql_database.default.name
}

output "db_user_name" {
  description = "The service account email used as the database IAM user."
  value       = google_sql_user.iam_user.name # This will be the service account email
}
