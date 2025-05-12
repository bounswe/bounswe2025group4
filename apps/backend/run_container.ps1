# Variables
$imageName = "ethical-job-board"
$containerName = "ethical-job-board-container"
$hostUploadDir = (Resolve-Path "./uploads").Path -replace '\\','/'
$containerUploadDir = "/app/uploads"
$port = 8080

# Step 1: Ensure local uploads/profile-pictures directory exists
$profilePicturesPath = Join-Path $hostUploadDir "profile-pictures"
if (-not (Test-Path $profilePicturesPath)) {
    New-Item -ItemType Directory -Path $profilePicturesPath -Force | Out-Null
    Write-Host "Created local upload directory at $profilePicturesPath"
}

# Step 2: Build Docker image
Write-Host "Building Docker image..."
docker build -t $imageName .

# Step 3: Remove old container if exists
Write-Host "Cleaning up old container (if exists)..."
docker rm -f $containerName 2>$null

# Step 4: Run container
Write-Host "Running container..."
docker run -d `
    --name $containerName `
    -p ${port}:8080 `
    -v "${hostUploadDir}:${containerUploadDir}" `
    $imageName

Write-Host "Container '$containerName' is running at http://localhost:$port"
