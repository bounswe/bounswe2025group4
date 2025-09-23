#!/bin/bash

cd apps/mobile

# Script to start the Flutter mobile application
echo "Starting Flutter application (mobile)..."

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "Error: Flutter is not installed or not in PATH"
    echo "Please install Flutter SDK"
    exit 1
fi

# Print Flutter version for troubleshooting
echo "Flutter version: $(flutter --version | head -n 1)"

# Ensure dependencies are up-to-date
echo "Ensuring dependencies are up-to-date..."
flutter pub get

# Check available devices
echo "Checking for available devices..."
flutter devices

# If no devices are connected, show helpful message
if [ "$(flutter devices | grep -c "device")" -le 1 ]; then
    echo "Warning: No physical devices or emulators detected."
    echo "You might need to start an emulator or connect a device before proceeding."
    echo "Do you want to continue anyway? (y/n)"
    read answer
    if [ "$answer" != "y" ]; then
        echo "Exiting. Start an emulator or connect a device, then try again."
        exit 1
    fi
fi

# Run the Flutter application
echo "Launching Flutter application..."
flutter run

# If the application doesn't start properly, print a helpful message
if [ $? -ne 0 ]; then
    echo "Failed to start the application. Please check that:"
    echo "1. A mobile device or emulator is connected and detected by Flutter"
    echo "2. The Flutter environment is properly configured"
    echo "3. All required dependencies are installed"
fi