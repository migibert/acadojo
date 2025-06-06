terraform {
  backend "gcs" {
    bucket = "your-terraform-state-bucket-name" // REPLACE THIS
    prefix = "terraform/foundations"
  }
}
