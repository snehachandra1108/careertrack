from datetime import date

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to CareerTrack"


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_and_list_application(client):
    payload = {
        "company": "Test Company",
        "role": "Software Engineering Intern",
        "applied_date": str(date.today()),
        "status": "Applied",
        "notes": "Automated test",
    }

    create_response = client.post("/applications", json=payload)
    assert create_response.status_code == 201

    created = create_response.json()
    assert created["company"] == payload["company"]
    assert created["role"] == payload["role"]
    assert "id" in created

    list_response = client.get("/applications")
    assert list_response.status_code == 200
    assert any(item["id"] == created["id"] for item in list_response.json())

    delete_response = client.delete(f"/applications/{created['id']}")
    assert delete_response.status_code == 204


def test_update_application(client):
    payload = {
        "company": "Update Test Company",
        "role": "Backend Intern",
        "applied_date": str(date.today()),
        "status": "Applied",
    }

    create_response = client.post("/applications", json=payload)
    assert create_response.status_code == 201
    application_id = create_response.json()["id"]

    update_response = client.patch(
        f"/applications/{application_id}",
        json={"status": "Interview"},
    )

    assert update_response.status_code == 200
    assert update_response.json()["status"] == "Interview"

    client.delete(f"/applications/{application_id}")


def test_missing_application_returns_404(client):
    response = client.get("/applications/99999999")
    assert response.status_code == 404


def test_invalid_application_returns_422(client):
    response = client.post(
        "/applications",
        json={
            "company": "",
            "role": "Intern",
            "applied_date": "not-a-date",
        },
    )
    assert response.status_code == 422
