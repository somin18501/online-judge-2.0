#!/usr/bin/env bash
# Build all judge runner images used by the execution service.
# The tags here must match DOCKER_IMAGE_* env vars in apps/api/.env.
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: 'docker' is not installed or not on PATH."
  echo "Install Docker Desktop (https://www.docker.com/products/docker-desktop/)"
  echo "or an equivalent (Colima, OrbStack) and try again."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon is not running."
  echo "Start it with one of:"
  echo "  Docker Desktop : open -a Docker"
  echo "  Colima         : colima start"
  echo "  OrbStack       : open -a OrbStack"
  echo "then re-run: bash docker/runners/build-all.sh"
  exit 1
fi

docker build -t au-judge-c:latest          -f c.Dockerfile          .
docker build -t au-judge-cpp:latest        -f cpp.Dockerfile        .
docker build -t au-judge-python:latest     -f python.Dockerfile     .
docker build -t au-judge-javascript:latest -f javascript.Dockerfile .

echo ""
echo "Runner images built:"
docker images | grep -E "^au-judge-" || true
