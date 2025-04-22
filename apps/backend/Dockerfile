# Dockerfile for Spring Boot backend with best practices

 # Build stage
 FROM eclipse-temurin:21-jdk-alpine AS builder
 WORKDIR /app

 # Copy only the files needed for dependency resolution first to leverage caching
 COPY pom.xml mvnw* ./
 COPY .mvn ./.mvn
 RUN chmod +x mvnw

 # Download dependencies first (cached if pom.xml doesn't change)
 RUN ./mvnw dependency:go-offline -B

 # Copy source code and build
 COPY src ./src
 # Specify Java version explicitly in the build command
 RUN ./mvnw package -DskipTests -Dmaven.compiler.release=21

 # Run stage - use distroless for minimal attack surface
 FROM gcr.io/distroless/java21-debian12
 WORKDIR /app

 # Copy the JAR file from the builder stage
 COPY --from=builder /app/target/*.jar app.jar

 # Add metadata
 LABEL org.opencontainers.image.title="Spring Boot Backend"
 LABEL org.opencontainers.image.description="Backend service for the application"
 LABEL org.opencontainers.image.version="1.0.0"

 # Use non-root user for added security
 USER nonroot:nonroot

 # Expose the port the app runs on
 EXPOSE 8080

 # Command to run the application
 ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]