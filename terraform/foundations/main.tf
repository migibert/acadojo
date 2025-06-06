# This file contains the core infrastructure resources (database, service accounts, etc.)
# for the BJJ Academy application's foundation layer.

resource "random_id" "db_instance_name_suffix" {
  byte_length = 4
}

resource "google_sql_database_instance" "default" {
  name             = "${var.db_instance_name_prefix}-${random_id.db_instance_name_suffix.hex}"
  project          = var.gcp_project_id # Added project attribute
  region           = var.gcp_region
  database_version = "POSTGRES_15" // Or your desired version
  settings {
    tier    = "db-f1-micro" // Or your desired tier
    ip_configuration {
      authorized_networks {
        value = "0.0.0.0/0" // WARNING: Open to all, refine this for production
        name  = "Allow all from anywhere" # Added name for authorized network
      }
      ipv4_enabled = true
    }
    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "on"
    }
  }
  deletion_protection = false // Set to true for production
}

resource "google_sql_database" "default" {
  name     = var.app_db_name
  project  = var.gcp_project_id
  instance = google_sql_database_instance.default.name
}

resource "google_service_account" "backend_sa" {
  account_id   = var.backend_service_account_id
  display_name = "Backend Service Account" # Changed from "Backend Cloud Run Service Account" for brevity
  project      = var.gcp_project_id
}

resource "google_project_iam_member" "backend_sa_sql_client" {
  project = var.gcp_project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

resource "google_sql_user" "iam_user" {
  name     = google_service_account.backend_sa.email
  project  = var.gcp_project_id
  instance = google_sql_database_instance.default.name
  type     = "CLOUD_IAM_SERVICE_ACCOUNT"
}

# All migrations-related resources (dedicated SA, its IAM bindings, its SQL user) are removed.
# The old password-based google_sql_user.migrations_user resource was already removed in a previous step.
