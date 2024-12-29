#!/usr/bin/env bash
set -o errexit  # Exit on error

echo "Installing dependencies..."
npm install  # Install all dependencies

echo "Managing Puppeteer cache..."
if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then 
  echo "...Copying Puppeteer Cache from Build Cache" 
  cp -R $XDG_CACHE_HOME/puppeteer/ $PUPPETEER_CACHE_DIR
else 
  echo "...Storing Puppeteer Cache in Build Cache" 
  cp -R $PUPPETEER_CACHE_DIR $XDG_CACHE_HOME
fi

echo "Building the frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Setup complete!"
