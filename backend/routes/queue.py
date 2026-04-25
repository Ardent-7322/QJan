from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from services.firebase import (
    get_queue_data, checkin_user, checkout_user,
    get_nearby_offices, get_all_offices,
)
from services.predictor import (
    calculate_wait_time, get_best_time, get_status, get_anomaly_status
)

router = APIRouter()


class CheckinRequest(BaseModel):
    session_id: str  # anonymous browser-generated ID, no account needed


# ── GET /queue/{office_id} ────────────────────────────────────────────────────
@router.get("/{office_id}")
async def get_queue(office_id: str):
    data = get_queue_data(office_id)
    if not data:
        raise HTTPException(status_code=404, detail="Office not found")

    wait_result = calculate_wait_time(
        current_count=data["current_count"],
        avg_service_time=data.get("avg_service_time", 4.5),
        arrival_rate=data.get("arrival_rate"),
    )

    best_time = get_best_time(data.get("history", {}))
    status = get_status(data["current_count"])
    anomaly = get_anomaly_status(
        data["current_count"],
        wait_result.get("utilisation"),
    )

    # Human-readable wait time string
    if wait_result["wait_mins"] is None:
        wait_display = "Estimate unavailable — queue is growing"
    else:
        wait_display = f"~{wait_result['wait_mins']} mins"

    return {
        "office_id": office_id,
        "name": data["name"],
        "type": data["type"],
        "current_count": data["current_count"],
        "estimated_wait_mins": wait_result["wait_mins"],
        "estimated_wait_display": wait_display,
        "utilisation": wait_result.get("utilisation"),
        "queue_stable": wait_result["stable"],
        "wait_model": wait_result["model"],
        "status": status,
        "best_time_today": best_time,
        "anomaly": anomaly,
        "avg_service_time": data.get("avg_service_time", 4.5),
        "data_freshness": "live",
    }


# ── POST /queue/{office_id}/checkin ───────────────────────────────────────────
@router.post("/{office_id}/checkin")
async def checkin(office_id: str, body: CheckinRequest):
    result = checkin_user(office_id, body.session_id)

    if result["reason"] == "not_found":
        raise HTTPException(status_code=404, detail="Office not found")

    if result["reason"] == "rate_limited":
        raise HTTPException(
            status_code=429,
            detail="You already checked in recently. Please wait before checking in again."
        )

    return {
        "message": "Checked in successfully",
        "office_id": office_id,
    }


# ── POST /queue/{office_id}/checkout ─────────────────────────────────────────
@router.post("/{office_id}/checkout")
async def checkout(office_id: str, body: CheckinRequest):
    success = checkout_user(office_id, body.session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Office not found or no active check-in")
    return {
        "message": "Checked out successfully",
        "office_id": office_id,
    }


# ── GET /queue/nearby ────────────────────────────────────────────────────────
@router.get("/nearby")
async def get_nearby(lat: float, lng: float, radius: float = 20):
    offices = get_nearby_offices(lat, lng, radius)
    return [
        {
            "office_id": o["office_id"],
            "name": o["name"],
            "type": o["type"],
            "city": o["city"],
            "area": o.get("area", ""),
            "lat": o.get("lat", 0),
            "lng": o.get("lng", 0),
            "distance_km": o.get("distance_km", 0),
            "current_count": o["current_count"],
            "status": get_status(o["current_count"]),
        }
        for o in offices
    ]


# ── GET /queue/ ───────────────────────────────────────────────────────────────
@router.get("/")
async def get_all():
    offices = get_all_offices()
    return [
        {
            "office_id": o["office_id"],
            "name": o["name"],
            "type": o["type"],
            "city": o["city"],
            "area": o.get("area", ""),
            "lat": o.get("lat", 0),
            "lng": o.get("lng", 0),
            "current_count": o["current_count"],
            "status": get_status(o["current_count"]),
        }
        for o in offices
    ]
