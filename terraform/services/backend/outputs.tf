output "backend_cloud_run_service_uri" {
  description = "URI of the deployed Backend Cloud Run service."
  value       = google_cloud_run_v2_service.backend_cloud_run_service.uri
}

output "backend_cloud_run_service_name" {
  description = "Name of the deployed Backend Cloud Run service."
  value       = google_cloud_run_v2_service.backend_cloud_run_service.name
}

output "frontend_cloud_run_service_uri" {
  description = "URI of the deployed Frontend Cloud Run service."
  value       = google_cloud_run_v2_service.frontend_cloud_run_service.uri
}

output "frontend_cloud_run_service_name" {
  description = "Name of the deployed Frontend Cloud Run service."
  value       = google_cloud_run_v2_service.frontend_cloud_run_service.name
}
