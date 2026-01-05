#!/bin/sh
set -e

# Ensure Prisma client exists
echo "Generating Prisma client..."
npx prisma generate

# Apply migrations with retries until DB is ready
echo "Applying Prisma migrations..."
until npx prisma migrate deploy; do
  echo "Prisma migrate failed or DB is not ready; retrying in 5s..."
  sleep 5
done

# Start the application
echo "Starting application..."
if [ "$#" -eq 0 ]; then
  exec npm run start:prod
else
  exec "$@"
fi