#!/bin/bash

cd apps/frontend

# Script to start the React frontend application
echo "Starting React application (frontend)..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js 18 or later"
    exit 1
fi

# Print Node.js and npm versions for troubleshooting
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies first..."
    npm install
fi

# Start the development server
echo "Starting development server..."
npm start

# If the application doesn't start properly, print a helpful message
if [ $? -ne 0 ]; then
    echo "Failed to start the application. Please check that:"
    echo "1. The required packages are installed (run 'npm install')"
    echo "2. The application port 3000 is not already in use"
    echo "3. The .env file contains the necessary environment variables"
fi