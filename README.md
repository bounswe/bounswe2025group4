# EthicaJobs — Web · Backend · Android

> This README matches our **monorepo** layout and our **Cloud Run** production deploy flow.
> A programmer can build and ship **web + backend + Android (.apk)** by following these steps.

---

## Repository layout

```
.
├─ apps/
│  ├─ jobboard-backend/     # Spring Boot (Java) API (deployed to Cloud Run)
│  ├─ jobboard-frontend/         # Web client (Vite/React) → Cloudflare Pages (pages.dev)
│  └─ jobboard-mobile/      # Android app (React Native / native Android Gradle)
├─ archive/
├─ .github/
│  └─ workflows/
│     └─ ...
└─ README.md
```

---

## Prerequisites

* **Git**
* **Docker** Desktop (Win/Mac) or Engine (Linux)
* **Node 20+** and **pnpm** (for `jobboard-
* **Java 17+ & Gradle** (only if running backend without Docker)
* **Android Studio** (SDK + Build-Tools) to build the **.apk**
* (Optional) **gcloud CLI** if you’ll deploy manually instead of GitHub Actions

---

## Environment variables

### Backend (`apps/jobboard-backend`)

These mirror production (Cloud Run) and local defaults. Put them in `apps/jobboard-backend/.env` when running locally, or pass via Docker `-e`.

| Key                          | Example                                               | Notes                               |
| ---------------------------- | ----------------------------------------------------- | ----------------------------------- |
| `APP_ENV`                    | `dev`                                                 | `dev`/`prod`                        |
| `PORT`                       | `8080`                                                | Service port                        |
| `SPRING_DATASOURCE_URL`      | `jdbc:postgresql://...:5432/jobboard?sslmode=require` | Neon/Cloud SQL/Local                |
| `SPRING_DATASOURCE_USERNAME` | `jobboard_owner`                                      | —                                   |
| `SPRING_DATASOURCE_PASSWORD` | `***`                                                 | In prod use Secret Manager          |
| `APP_VERIFY_EMAIL_URL`       | `https://bounswe-jobboard.pages.dev`                  | Web base URL                        |
| `APP_RESET_PASSWORD_URL`     | `https://bounswe-jobboard.pages.dev/reset-password`   | —                                   |
| `APP_CORS_ALLOWED_ORIGINS`   | `https://bounswe-jobboard.pages.dev`                  | Comma-separated if multiple         |
| `APP_GCS_BUCKET`             | `bounswe-jobboard`                                    | GCS bucket name                     |
| `APP_MAIL_FROM`              | `no-reply@example.com`                                | Sender                              |
| `MAIL_USERNAME`              | `apikey`                                              | ESP user (e.g., SendGrid)           |
| `MAIL_PASSWORD`              | `***`                                                 | ESP API key/secret (secret in prod) |
| `APP_JWT_SECRET`             | `***`                                                 | Secret (secret in prod)             |

### Web (`apps/jobboard-frontend`)

Create `apps/jobboard-frontend/.env`:

```dotenv
VITE_API_URL=https://<your-cloud-run-service-url>   # or http://localhost:8080 for local
```

### Mobile (`apps/jobboard-mobile`)

Create `apps/jobboard-mobile/.env` (if the app reads API URL):

```dotenv
API_BASE_URL=http://10.0.2.2:8080   # Android emulator to host; use LAN IP on a device
```

---

## Running Everything with Docker Compose

This is the easiest way to run the full stack (Backend, Frontend, Mobile Web, Database).

### Prerequisites
1.  **Docker** and **Docker Compose**.
2.  **Service Account Key**: Ensure `apps/jobboard-backend/jobboard-local-service-account-key.json` exists if you want to use features involving file uploads like profile photographs or CVs.
3.  **Sendgrid API Key**: If you want to test the registration email verification and 2FA flow. Set this at mail_password env variable on docker compose.

### Steps
1.  Run the following command in the root directory:
    ```bash
    docker compose up --build
    ```
2.  Access the applications:
    *   **Frontend**: http://localhost:5173
    *   **Mobile App on Web**: http://localhost:8081/
    *   **Backend API**: http://localhost:8080
    *   **Database**: localhost:5432

The registration verifications and 2FA mails are disabled at local development environments for ease. You can use 000000 as 2FA code.
It is suggested to select a mobile device from developer tools when using the mobile app on browser for best experience.
If you want to use the apk file, see the below instructions for building an apk, or download the latest version from releases.

---

## Quick start (local) — minimal Docker

### 1) Backend (Docker)

From repo root:

```bash
# Build the backend image
docker build -t jobboard-backend:local ./apps/jobboard-backend

# Run it (change envs as needed)
docker run --name jobboard-api --rm -p 8080:8080 \
  -e APP_ENV=dev \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://ep-rough-tooth-ag6x82ho-pooler.c-2.eu-central-1.aws.neon.tech:5432/jobboard?sslmode=require" \
  -e SPRING_DATASOURCE_USERNAME="jobboard_owner" \
  -e SPRING_DATASOURCE_PASSWORD="your-local-dev-pass" \
  -e APP_VERIFY_EMAIL_URL="http://localhost:5173" \
  -e APP_RESET_PASSWORD_URL="http://localhost:5173/reset-password" \
  -e APP_CORS_ALLOWED_ORIGINS="http://localhost:5173" \
  -e MAIL_USERNAME="apikey" \
  -e MAIL_PASSWORD="dev-mail-pass" \
  -e APP_JWT_SECRET="dev-jwt-secret" \
  -e APP_GCS_BUCKET="bounswe-jobboard" \
  -e APP_MAIL_FROM="no-reply@local.dev" \
  jobboard-backend:local
```

API will be available at `http://localhost:8080`.

### 2) Web (Vite/React)

```bash
cd apps/jobboard-web
pnpm install
pnpm dev
# -> http://localhost:5173  (talks to http://localhost:8080 if VITE_API_BASE_URL set that way)
```

### 3) Android (.apk)

```bash
cd apps/jobboard-mobile
pnpm install   # if React Native; skip if pure native
cd android
./gradlew assembleRelease
# APK: apps/jobboard-mobile/android/app/build/outputs/apk/release/app-release.apk
```

Install to emulator/device:

```bash
adb install -r app-release.apk
```

> On emulator, ensure the app’s base URL is `http://10.0.2.2:8080`. On a physical device, use your machine’s **LAN IP**.

---

## Web (build & deploy)

### Local production build

```bash
cd apps/jobboard-web
pnpm install
pnpm build
pnpm preview   # serves the built assets locally
```

### Cloudflare Pages (recommended)

Copy the builded version of the web app to Claude pages like in the frontend deploy workflows.
Set the following **environment variable** in your Pages project:

* `VITE_API_BASE_URL=https://<your-cloud-run-service-url>`

Then connect the repo and let Pages build the site (default Vite build is fine).

---

## Backend (build, run & deploy)

### Build locally with Docker

```bash
docker build -t jobboard-backend:local ./apps/jobboard-backend
```

### Run without Docker (Java)

```bash
cd apps/jobboard-backend
# set envs in .env or export them
./gradlew bootRun
# or
./gradlew build && java -jar build/libs/*.jar
```

### Production deploy (Cloud Run via GitHub Actions)

We ship to **Cloud Run** using `.github/workflows/backend-deploy-prod.yml`:

```yaml
name: Jobboard Backend Production Deployment
on:
  push:
    branches: [ main ]
    paths:
      - "apps/jobboard-backend/**"
      - ".github/workflows/backend-deploy-prod.yml"
```

**What it does**

* Authenticates to GCP using `secrets.GCP_SA_KEY` (a JSON service account key).
* Builds `apps/jobboard-backend` Docker image.
* Pushes to **Artifact Registry** `${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}`.
* Deploys to **Cloud Run** `jobboard-backend` with env vars and **Secret Manager** references.

**Required repository secrets**

* `GCP_SA_KEY` — Service Account JSON for a principal with:

  * `roles/run.admin`, `roles/artifactregistry.writer`, `roles/secretmanager.secretAccessor`, `roles/storage.objectViewer` (if using GCS), and access to Neon/DB if needed.

**Configured env (in workflow)**

```yaml
env:
  PROJECT_ID: shadowops-dev
  REGION: europe-west1
  REPO_NAME: jobboard-containers
```

**Secrets mounted at deploy**

```bash
--set-secrets "SPRING_DATASOURCE_PASSWORD=jobboard-neon-db-pass:latest"
--set-secrets "APP_JWT_SECRET=jobboard-jwt-secret-prod:latest"
--set-secrets "MAIL_PASSWORD=jobboard-mail-password:latest"
```

> When the **main** branch is pushed with changes under `apps/jobboard-backend/**`, the workflow builds and redeploys production.

---

## Android — build & ship the .apk

1. **Install toolchain**

   * Android Studio + SDK + Build-Tools
   * `ANDROID_HOME` configured (Android Studio usually handles this)

2. **Point the app to the API**

   * Emulator: `API_BASE_URL=http://10.0.2.2:8080`
   * Physical device: `API_BASE_URL=http://<your-machine-lan-ip>:8080`
   * Production: `https://<your-cloud-run-service-url>`

3. **Build release**

   ```bash
   cd apps/jobboard-mobile/android
   ./gradlew assembleRelease
   ```

   Output:
   `apps/jobboard-mobile/android/app/build/outputs/apk/release/app-release.apk`

4. **Sign (recommended for distribution)**

   * Create a release keystore
   * Configure `gradle.properties` and `app/build.gradle`
   * Re-run `assembleRelease`

5. **Attach to GitHub Release**

   * On tag/release, upload `app-release.apk` under **Assets**

---

## Docker references (Artifact Registry / manual)

**Authenticate**

```bash
gcloud auth configure-docker europe-west1-docker.pkg.dev --quiet --project <PROJECT_ID>
```

**Build & push**

```bash
IMAGE="europe-west1-docker.pkg.dev/<PROJECT_ID>/<REPO_NAME>/jobboard-backend:prod-$(git rev-parse --short HEAD)"
docker build -t "$IMAGE" ./apps/jobboard-backend
docker push "$IMAGE"
```

**Deploy**

```bash
gcloud run deploy jobboard-backend \
  --image "$IMAGE" \
  --region europe-west1 \
  --project <PROJECT_ID> \
  --service-account jobboard-runtime@<PROJECT_ID>.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 1 \
  --concurrency 80 \
  --set-env-vars "APP_ENV=prod" \
  --set-env-vars "SPRING_DATASOURCE_URL=jdbc:postgresql://...:5432/jobboard?sslmode=require" \
  --set-env-vars "SPRING_DATASOURCE_USERNAME=jobboard_owner" \
  --set-env-vars "APP_VERIFY_EMAIL_URL=https://bounswe-jobboard.pages.dev" \
  --set-env-vars "APP_RESET_PASSWORD_URL=https://bounswe-jobboard.pages.dev/reset-password" \
  --set-env-vars "APP_CORS_ALLOWED_ORIGINS=https://bounswe-jobboard.pages.dev" \
  --set-env-vars "MAIL_USERNAME=apikey" \
  --set-env-vars "APP_GCS_BUCKET=bounswe-jobboard" \
  --set-env-vars "APP_MAIL_FROM=no-reply@example.com" \
  --set-secrets "SPRING_DATASOURCE_PASSWORD=jobboard-neon-db-pass:latest" \
  --set-secrets "APP_JWT_SECRET=jobboard-jwt-secret-prod:latest" \
  --set-secrets "MAIL_PASSWORD=jobboard-mail-password:latest"
```
## Troubleshooting

* **Android can’t reach API**

  * Emulator → use `http://10.0.2.2:<port>`
  * Device → use host **LAN IP**
  * Ensure Cloud Run allows unauthenticated or you pass auth headers
* **CORS errors on web**

  * Add the site origin to `APP_CORS_ALLOWED_ORIGINS` (comma-separated)
* **DB auth/SSL issues**

  * For Neon/hosted Postgres, keep `sslmode=require`
* **Mail not delivered**

  * Verify `MAIL_USERNAME/MAIL_PASSWORD` and `APP_MAIL_FROM` with your ESP
* **Artifact Registry push denied**

  * Re-run `gcloud auth configure-docker <region>-docker.pkg.dev` and check IAM

---

## Contributing

* Branch: `dev -> feat/<issue-id>-short-desc`
* Run format/lint/tests locally
* Open PR with screenshots for UI and sample requests for API changes

