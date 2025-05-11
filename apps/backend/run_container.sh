#!/bin/bash

# Variables
imageName="ethical-job-board"
containerName="ethical-job-board-container"
# Using relative path, adjust if absolute path is needed
hostUploadDir="./uploads"
containerUploadDir="/app/uploads"
port=8080

# Step 1: Ensure local uploads/profile-pictures directory exists
profilePicturesPath="${hostUploadDir}/profile-pictures"
# Check if directory exists, if not create it
if [ ! -d "$profilePicturesPath" ]; then
    mkdir -p "$profilePicturesPath"
    echo "Created local upload directory at $profilePicturesPath"
fi

# Step 2: Build Docker image
echo "📦 Building Docker image..."
docker build -t "$imageName" .

# Check if the build was successful
if [ $? -ne 0 ]; then
    echo "❌ Docker image build failed."
    exit 1
fi

# Step 3: Remove old container if exists
echo "🧹 Cleaning up old container (if exists)..."
# Redirect stderr to /dev/null to suppress "no such container" errors
docker rm -f "$containerName" 2>/dev/null

# Step 4: Run container
echo "🚀 Running container..."
docker run -d \
    --name "$containerName" \
    -p "${port}:8080" \
    -v "$(pwd)/${hostUploadDir}:${containerUploadDir}" \
    "$imageName"

# Check if the container started successfully
if [ $? -ne 0 ]; then
    echo "❌ Docker container failed to start."
    exit 1
fi

echo "✅ Container '$containerName' is running at http://localhost:'$port'"

