output "db_instance_connection_name" {
  description = "The connection name of the Cloud SQL instance."
  value       = google_sql_database_instance.default.connection_name
}

output "app_db_name_output" {
  description = "The name of the main application database."
  value       = google_sql_database.default.name
}

output "backend_service_account_email" {
  description = "The email of the backend service account."
  value       = google_service_account.backend_sa.email
}

# Removed migrations_service_account_email output
# Removed db_migrations_user_name_output as the user is now IAM based and identified by SA email (already done, comment retained)

output "cloud_sql_instance_ip_address" {
  description = "The public IP address of the Cloud SQL instance."
  value       = google_sql_database_instance.default.public_ip_address
}

output "cloud_sql_instance_name" {
 description = "The name of the Cloud SQL instance."
 value = google_sql_database_instance.default.name
}
