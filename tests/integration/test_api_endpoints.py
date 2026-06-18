import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_health_ready_endpoints(app_client: AsyncClient):
    """Verify open endpoints are accessible."""
    # We can use the app_client even if it has authentication headers, as they are open
    res_health = await app_client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json() == {"status": "ok"}

    res_ready = await app_client.get("/ready")
    assert res_ready.status_code == 200
    assert res_ready.json() == {"status": "ready"}


@pytest.mark.anyio
async def test_gated_dashboard_stats(app_client: AsyncClient):
    """Verify getting dashboard stats works."""
    response = await app_client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_packets" in data
    assert "normal_traffic" in data
    assert "threat_level" in data


@pytest.mark.anyio
async def test_gated_monitoring_status(app_client: AsyncClient):
    """Verify getting live monitoring status works."""
    response = await app_client.get("/api/v1/monitoring/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_running" in data
    assert "packet_count" in data


@pytest.mark.anyio
async def test_gated_packets(app_client: AsyncClient):
    """Verify getting packets list works."""
    response = await app_client.get("/api/v1/packets")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.anyio
async def test_gated_ml_models(app_client: AsyncClient):
    """Verify getting ML models list works."""
    response = await app_client.get("/api/v1/ml/models")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.anyio
async def test_gated_attacks(app_client: AsyncClient):
    """Verify getting attacks list works."""
    response = await app_client.get("/api/v1/attacks")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data


@pytest.mark.anyio
async def test_gated_alerts(app_client: AsyncClient):
    """Verify getting alerts list works."""
    response = await app_client.get("/api/v1/alerts")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data


@pytest.mark.anyio
async def test_gated_reports(app_client: AsyncClient):
    """Verify getting reports list works."""
    response = await app_client.get("/api/v1/reports")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.anyio
async def test_gated_datasets(app_client: AsyncClient):
    """Verify getting datasets list works."""
    response = await app_client.get("/api/v1/datasets")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.anyio
async def test_gated_users(app_client: AsyncClient):
    """Verify getting users list works."""
    response = await app_client.get("/api/v1/users")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data


@pytest.mark.anyio
async def test_gated_logs_system(app_client: AsyncClient):
    """Verify getting system logs works."""
    response = await app_client.get("/api/v1/logs/system")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data


@pytest.mark.anyio
async def test_gated_settings(app_client: AsyncClient):
    """Verify getting settings works."""
    response = await app_client.get("/api/v1/settings")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.anyio
async def test_gated_profile(app_client: AsyncClient):
    """Verify getting current user profile works."""
    response = await app_client.get("/api/v1/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "test_analyst"
