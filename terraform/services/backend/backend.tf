terraform {
  backend "gcs" {
    bucket = "your-terraform-state-bucket-name" // REPLACE THIS (same as foundation or new)
    prefix = "terraform/services/backend"
  }
}
