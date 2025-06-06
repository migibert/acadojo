#!/bin/bash

# === One-Time Database Preparation Script ===
#
# Purpose: Grants necessary DDL/DCL privileges to the backend application's
#          runtime Service Account SQL user, enabling it to manage its own schema
#          via TypeORM migrations on application startup.
#
# WARNING: This script requires the password for the 'postgres' superuser of your
#          Cloud SQL instance. Handle this password securely.
#          Test thoroughly in a non-production environment first.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated with necessary permissions.
#   - psql (PostgreSQL client) installed.
#   - Cloud SQL Proxy will be downloaded by this script if not found.

set -e # Exit immediately if a command exits with a non-zero status.
# set -x # Uncomment for verbose debugging

# --- Configuration - PLEASE EDIT THESE or PASS AS ENVIRONMENT VARIABLES ---
GCP_PROJECT_ID="${GCP_PROJECT_ID:-}" # Example: your-gcp-project-id
CLOUD_SQL_INSTANCE_NAME="${CLOUD_SQL_INSTANCE_NAME:-}" # Example: bjj-academy-instance-xxxx
APP_DATABASE_NAME="${APP_DATABASE_NAME:-}"   # Example: bjj-academy-app-db
BACKEND_SA_EMAIL="${BACKEND_SA_EMAIL:-}"     # Example: backend-sa@your-project.iam.gserviceaccount.com
# POSTGRES_SUPERUSER_PASSWORD will be prompted for if not set as an environment variable

# --- Temporary Admin SQL User Configuration ---
TEMP_ADMIN_USER="temp_prep_admin_$(date +%s)" # Unique name with timestamp
TEMP_ADMIN_PASSWORD=$(openssl rand -base64 32) # Generate a strong random password

# --- Cloud SQL Proxy Configuration ---
PROXY_DIR="./.proxy_temp"
PROXY_BINARY="${PROXY_DIR}/cloud-sql-proxy"
PROXY_PORT="55432" # Use a non-default port to avoid conflict
INSTANCE_CONNECTION_NAME="" # Will be fetched later

# --- Helper Functions ---
info() {
  echo "INFO: $1"
}

error() {
  echo "ERROR: $1" >&2
  exit 1
}

cleanup_proxy() {
  info "Cleaning up Cloud SQL Proxy..."
  if [ -n "$PROXY_PID" ] && ps -p $PROXY_PID > /dev/null; then
    kill $PROXY_PID
    wait $PROXY_PID 2>/dev/null || true
  fi
  rm -rf "${PROXY_DIR}"
}

# --- Script Execution ---

# Trap exit signals to ensure cleanup
trap cleanup_proxy EXIT SIGINT SIGTERM

# 1. Validate Inputs
if [ -z "$GCP_PROJECT_ID" ]; then
  read -r -p "Enter GCP Project ID: " GCP_PROJECT_ID
  if [ -z "$GCP_PROJECT_ID" ]; then error "GCP Project ID is required."; fi
fi
if [ -z "$CLOUD_SQL_INSTANCE_NAME" ]; then
  read -r -p "Enter Cloud SQL Instance Name: " CLOUD_SQL_INSTANCE_NAME
  if [ -z "$CLOUD_SQL_INSTANCE_NAME" ]; then error "Cloud SQL Instance Name is required."; fi
fi
if [ -z "$APP_DATABASE_NAME" ]; then
  read -r -p "Enter Application Database Name: " APP_DATABASE_NAME
  if [ -z "$APP_DATABASE_NAME" ]; then error "Application Database Name is required."; fi
fi
if [ -z "$BACKEND_SA_EMAIL" ]; then
  read -r -p "Enter Backend SA Email (runtime SQL user): " BACKEND_SA_EMAIL
  if [ -z "$BACKEND_SA_EMAIL" ]; then error "Backend SA Email is required."; fi
fi
if [ -z "$POSTGRES_SUPERUSER_PASSWORD" ]; then
  read -s -r -p "Enter Password for 'postgres' Cloud SQL user: " POSTGRES_SUPERUSER_PASSWORD
  echo
  if [ -z "$POSTGRES_SUPERUSER_PASSWORD" ]; then error "Password for 'postgres' user is required."; fi
fi

info "Fetching instance connection name..."
# Attempt to get the region from the instance name if it follows project:region:instance format
INSTANCE_REGION=$(echo "${CLOUD_SQL_INSTANCE_NAME}" | cut -d':' -f2)
# Fallback or ensure gcloud can infer region if not part of the instance name string passed.
# For `gcloud sql instances describe`, the instance name alone is usually sufficient if project is set.
INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe "${CLOUD_SQL_INSTANCE_NAME}" \
  --project="${GCP_PROJECT_ID}" \
  --format="value(connectionName)")
if [ -z "$INSTANCE_CONNECTION_NAME" ]; then
  error "Could not fetch instance connection name for ${CLOUD_SQL_INSTANCE_NAME}."
fi
info "Instance connection name: ${INSTANCE_CONNECTION_NAME}"


# 2. Download and Setup Cloud SQL Proxy
info "Setting up Cloud SQL Proxy..."
mkdir -p "${PROXY_DIR}"
if [ ! -f "${PROXY_BINARY}" ]; then
  wget https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.2/cloud-sql-proxy.linux.amd64 -O "${PROXY_BINARY}" || error "Failed to download Cloud SQL Proxy."
  chmod +x "${PROXY_BINARY}"
fi

# 3. Create Temporary Admin SQL User via gcloud
info "Creating temporary admin SQL user '${TEMP_ADMIN_USER}'..."
gcloud sql users create "${TEMP_ADMIN_USER}" \
  --instance="${CLOUD_SQL_INSTANCE_NAME}" \
  --project="${GCP_PROJECT_ID}" \
  --password="${TEMP_ADMIN_PASSWORD}" || error "Failed to create temporary admin user '${TEMP_ADMIN_USER}'."

# 4. Elevate Privileges of Temporary Admin User
info "Elevating privileges for '${TEMP_ADMIN_USER}' using 'postgres' user..."
info "Starting Cloud SQL Proxy for 'postgres' user connection (Instance: ${INSTANCE_CONNECTION_NAME})..."
# The proxy command takes the full instance connection name.
"${PROXY_BINARY}" "${INSTANCE_CONNECTION_NAME}" --port "${PROXY_PORT}" &
PROXY_PID=$!
# Wait for proxy to be ready by checking for listening port
info "Waiting for proxy to start on port ${PROXY_PORT}..."
timeout=15
while ! nc -z 127.0.0.1 "${PROXY_PORT}" && [ $timeout -gt 0 ]; do
  sleep 1
  timeout=$((timeout-1))
done
if [ $timeout -eq 0 ]; then
  error "Cloud SQL Proxy did not start on port ${PROXY_PORT} in time."
fi
info "Proxy started."

PGPASSWORD="${POSTGRES_SUPERUSER_PASSWORD}" psql \
  "host=127.0.0.1 port=${PROXY_PORT} dbname=${APP_DATABASE_NAME} user=postgres sslmode=disable" \
  -c "ALTER USER \"${TEMP_ADMIN_USER}\" WITH SUPERUSER;" || error "Failed to elevate privileges for '${TEMP_ADMIN_USER}'. Ensure 'postgres' password is correct and user has permissions."

info "Stopping Cloud SQL Proxy for 'postgres' user..."
kill $PROXY_PID
wait $PROXY_PID 2>/dev/null || true
PROXY_PID=""

# 5. Grant Permissions to Backend SA's SQL User (as Temporary Admin User)
info "Granting DDL/DCL permissions to '${BACKEND_SA_EMAIL}' using temporary admin user '${TEMP_ADMIN_USER}'..."
info "Starting Cloud SQL Proxy for '${TEMP_ADMIN_USER}' connection (Instance: ${INSTANCE_CONNECTION_NAME})..."
"${PROXY_BINARY}" "${INSTANCE_CONNECTION_NAME}" --port "${PROXY_PORT}" &
PROXY_PID=$!
info "Waiting for proxy to start on port ${PROXY_PORT}..."
timeout=15
while ! nc -z 127.0.0.1 "${PROXY_PORT}" && [ $timeout -gt 0 ]; do
  sleep 1
  timeout=$((timeout-1))
done
if [ $timeout -eq 0 ]; then
  error "Cloud SQL Proxy did not start on port ${PROXY_PORT} in time for temp admin."
fi
info "Proxy started."

GRANT_SQL=$(cat <<-EOF
-- Grant permissions on the schema itself
GRANT CREATE ON SCHEMA public TO "${BACKEND_SA_EMAIL}";
GRANT USAGE ON SCHEMA public TO "${BACKEND_SA_EMAIL}";

-- Grant DML permissions on existing tables (if any) and future tables in this schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${BACKEND_SA_EMAIL}";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "${BACKEND_SA_EMAIL}"; -- For existing tables

-- Grant permissions for sequences (if using serial types for IDs)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO "${BACKEND_SA_EMAIL}";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "${BACKEND_SA_EMAIL}"; -- For existing sequences
EOF
)

PGPASSWORD="${TEMP_ADMIN_PASSWORD}" psql \
  "host=127.0.0.1 port=${PROXY_PORT} dbname=${APP_DATABASE_NAME} user=${TEMP_ADMIN_USER} sslmode=disable" \
  -c "${GRANT_SQL}" || error "Failed to grant permissions to '${BACKEND_SA_EMAIL}'."

info "Stopping Cloud SQL Proxy for '${TEMP_ADMIN_USER}'..."
kill $PROXY_PID
wait $PROXY_PID 2>/dev/null || true
PROXY_PID=""


# 6. Delete Temporary Admin SQL User via gcloud
info "Deleting temporary admin SQL user '${TEMP_ADMIN_USER}'..."
gcloud sql users delete "${TEMP_ADMIN_USER}" \
  --instance="${CLOUD_SQL_INSTANCE_NAME}" \
  --project="${GCP_PROJECT_ID}" \
  --quiet || error "Failed to delete temporary admin user '${TEMP_ADMIN_USER}'. Manual cleanup may be required."

info "Database preparation script completed successfully!"
exit 0
