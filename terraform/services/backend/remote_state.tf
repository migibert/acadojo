data "terraform_remote_state" "foundations" {
  backend = "gcs"
  config = {
    bucket = "your-terraform-state-bucket-name" // REPLACE THIS (must match foundation's bucket)
    prefix = "terraform/foundations"          // Must match foundation's prefix
  }
}
