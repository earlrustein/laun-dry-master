#!/usr/bin/env bash
set -o errexit  # Exit on error

echo "Installing dependencies..."
npm install  # Install all dependencies

echo "Installing Puppeteer Chrome..."
npx puppeteer browsers install chrome  # Install Puppeteer Chrome

echo "Building the frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Setup complete!"
