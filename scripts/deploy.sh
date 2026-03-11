#!/bin/bash
# Deploy script — chạy trên VPS
set -e

echo "==> Pulling latest code..."
git pull origin master

echo "==> Building & restarting containers..."
docker compose -f docker-compose.prod.yml build --no-cache api
docker compose -f docker-compose.prod.yml up -d

echo "==> Cleaning old images..."
docker image prune -f

echo "==> Done! Containers running:"
docker compose -f docker-compose.prod.yml ps
