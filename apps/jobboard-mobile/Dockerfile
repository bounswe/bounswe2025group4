# Stage 1: Build the Flutter Web application
FROM ghcr.io/cirruslabs/flutter:stable AS build

WORKDIR /app

# Copy pubspec files
COPY pubspec.yaml pubspec.lock ./

# Get dependencies
RUN flutter pub get

# Copy the rest of the application
COPY . .

# Build for web
ARG API_BASE_URL
RUN flutter build web --dart-define=API_BASE_URL=$API_BASE_URL --release

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the build artifacts from the previous stage
COPY --from=build /app/build/web /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
