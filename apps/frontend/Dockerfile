# Dockerfile for React frontend with best practices

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies (cached if package.json doesn't change)
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY public ./public
COPY src ./src
# Copy any other necessary build files
COPY *.js *.json ./
RUN npm run build

# Runtime stage
FROM nginx:alpine
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Add metadata
LABEL org.opencontainers.image.title="React Frontend"
LABEL org.opencontainers.image.description="Frontend service for the application"
LABEL org.opencontainers.image.version="1.0.0"

# Use non-root user for security (nginx already runs as nginx user)
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:80/ || exit 1