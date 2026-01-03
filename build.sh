#!/bin/bash
set -e

# Find the repository root by looking for package.json with workspaces
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR"

# If we're in frontend directory, go up one level
if [ -d "frontend" ] && [ ! -d "shared" ]; then
  # We're already at root, but shared might be missing
  echo "Warning: shared directory not found at current location"
fi

# If we're in a subdirectory, try to find the root
if [ ! -f "package.json" ] || [ ! -d "shared" ]; then
  # Try going up directories to find the root
  while [ "$(pwd)" != "/" ]; do
    if [ -f "package.json" ] && [ -d "shared" ] && [ -d "frontend" ]; then
      REPO_ROOT="$(pwd)"
      break
    fi
    cd ..
  done
fi

cd "$REPO_ROOT"

# Verify we're in the right place
if [ ! -d "shared" ] || [ ! -d "frontend" ]; then
  echo "Error: Cannot find repository root with shared and frontend directories"
  echo "Current directory: $(pwd)"
  echo "Contents: $(ls -la)"
  exit 1
fi

echo "Building from repository root: $(pwd)"

# Root npm install already installed all workspace dependencies
# Just run the build commands directly

# Build shared package
echo "Building shared package..."
cd shared
npm run build
cd ..

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "Build completed successfully!"

