# Jobboard Backend

## Build the Docker image
```bash
docker build . -t jobboard-backend
```

## Run the application
```bash
docker run -p 8080:8080 jobboard-backend
```

The application will be available at `http://localhost:8080/`