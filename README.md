# CareerTrack — Student Placement & Career Preparation Platform

CareerTrack is a full-stack web application for tracking job applications and managing placement preparation. It is being developed as a DevOps capstone project, with an emphasis on automated testing, containerization, CI/CD, security scanning, infrastructure as code, orchestration, and monitoring.

## Features

- View and track job applications.
- Add applications with company, role, application date, status, and notes.
- Update application status.
- Delete applications.
- View dashboard summaries for interviews, offers, and rejections.
- Store application data in PostgreSQL.
- Validate backend endpoints with automated tests.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Nginx |
| Backend | Python, FastAPI |
| Database | PostgreSQL, SQLAlchemy |
| Testing | pytest, FastAPI TestClient |
| Containers | Docker, Docker Compose |
| Planned DevOps | GitHub Actions, Trivy, Terraform, Kubernetes, Helm, Prometheus, Grafana |

## Architecture

The React frontend is served by Nginx. Nginx forwards API requests to the FastAPI backend, which communicates with PostgreSQL.

```text
Browser
   |
   v
React frontend + Nginx (:8080)
   |
   v
FastAPI backend (:8000)
   |
   v
PostgreSQL (:5432)
```

## Run with Docker Compose

### Prerequisites

- Docker Engine
- Docker Compose plugin

### Start the application

Create a local `.env` file containing the required PostgreSQL settings. Do not commit this file.

```env
POSTGRES_DB=careertrack
POSTGRES_USER=careertrack_user
POSTGRES_PASSWORD=replace_with_a_local_password
DATABASE_URL=postgresql+psycopg://careertrack_user:replace_with_a_local_password@localhost:5432/careertrack
```

Use the same password consistently in both settings. If the password contains URL-reserved characters, URL-encode it in `DATABASE_URL`.

Build and start the services:

```bash
docker compose up --build -d
```

Open the frontend at [http://localhost:8080](http://localhost:8080).

The backend health endpoint is available at [http://localhost:8000/health](http://localhost:8000/health), and interactive API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

### Useful Docker commands

```bash
docker compose ps
docker compose logs -f
docker compose logs backend
docker compose stop
docker compose up -d
```

The PostgreSQL data is stored in a named Docker volume. Avoid `docker compose down -v` unless you intentionally want to delete that volume and its data.

## Run Backend Tests

Activate the project's Python virtual environment and run:

```bash
source .venv/bin/activate
python -m pytest -v
```

The current test suite covers the root and health endpoints, application creation and listing, status updates, missing applications, and invalid input.

## Development Status

The frontend, backend, and PostgreSQL database currently run together through Docker Compose. Backend tests are passing.

The following DevOps capabilities are planned for subsequent milestones:

- Git and GitHub workflow
- GitHub Actions CI/CD
- Trivy image and dependency scanning
- Terraform-based AWS infrastructure
- Kubernetes deployment and Helm packaging
- Prometheus and Grafana monitoring

## Security Notes

- Keep `.env`, credentials, tokens, and other secrets out of Git.
- Use non-production credentials for local development.
- Review cloud costs before provisioning AWS resources.
