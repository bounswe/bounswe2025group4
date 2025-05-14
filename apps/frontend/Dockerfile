# ---------- Build Stage ----------
FROM node:22-alpine AS builder

# Declare the build argument
ARG VITE_API_BASE_URL

# Set the environment variable from the build argument
ENV VITE_API_BASE_URL="https://bounswe2025group4-327739565032.europe-west1.run.app/api"

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy source files
COPY . .

# Build the Vite project
RUN pnpm run build

# ---------- Run Stage ----------
FROM nginx:1.27-alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default NGINX config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (used by NGINX)
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
    