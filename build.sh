#!/bin/bash
set -e

# Ensure we're in the repository root
if [ ! -d "shared" ] || [ ! -d "frontend" ]; then
  echo "Error: shared or frontend directory not found. Current directory: $(pwd)"
  echo "Contents: $(ls -la)"
  exit 1
fi

# Build shared package
echo "Building shared package..."
cd shared
npm install
npm run build
cd ..

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Build completed successfully!"

