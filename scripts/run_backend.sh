#!/bin/bash

cd apps/backend

# Script to start the Spring Boot application
echo "Starting Spring Boot application (backend)..."

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "Error: Java is not installed or not in PATH"
    echo "Please install Java 17 or later"
    exit 1
fi

# Print Java version for troubleshooting
java -version

# Start the application using Maven wrapper
./mvnw spring-boot:run

# If the application doesn't start properly, print a helpful message
if [ $? -ne 0 ]; then
    echo "Failed to start the application. Please check that:"
    echo "1. You have Maven properly configured"
    echo "2. The application port 8080 is not already in use"
    echo "3. All required environment variables are set"
fi
