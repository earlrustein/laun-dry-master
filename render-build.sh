#!/usr/bin/env bash
set -o errexit  # Exit on error

# Ensure the Puppeteer cache directory is set
export PUPPETEER_CACHE_DIR=/opt/render/project/puppeteer

echo "PUPPETEER_CACHE_DIR: $PUPPETEER_CACHE_DIR"
echo "XDG_CACHE_HOME: $XDG_CACHE_HOME"

# Copy the cache only if it doesn't already exist
if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then 
  echo "...Copying Puppeteer Cache from Build Cache" 
  cp -R $XDG_CACHE_HOME/puppeteer/ $PUPPETEER_CACHE_DIR
else 
  echo "...Storing Puppeteer Cache in Build Cache" 
  cp -R $PUPPETEER_CACHE_DIR $XDG_CACHE_HOME
fi

# Proceed with building the frontend and backend
echo "Installing dependencies..."
npm install  # Install all dependencies

echo "Building the frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Setup complete!"
