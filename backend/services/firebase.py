import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta, timezone
import math

if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ─── Config ──────────────────────────────────────────────────────────────────
CHECKIN_WINDOW_MINUTES = 20       # checkins older than this are "expired"
ARRIVAL_RATE_WINDOW_MINUTES = 10  # window used to calculate lambda
RATE_LIMIT_WINDOW_MINUTES = 15    # how long before same session can check in again
# ─────────────────────────────────────────────────────────────────────────────


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    dlat, dlng = lat2 - lat1, lng2 - lng1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    return round(R * 2 * math.asin(math.sqrt(a)), 1)


def _active_checkin_count(office_id: str) -> int:
    """Count check-ins within the rolling CHECKIN_WINDOW_MINUTES."""
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=CHECKIN_WINDOW_MINUTES)
    # Single field query only — no composite index needed
    # Filter status in Python to avoid Firestore index requirement
    checkins = (
        db.collection("offices")
        .document(office_id)
        .collection("checkins")
        .where("timestamp", ">=", cutoff)
        .stream()
    )
    return sum(1 for c in checkins if c.to_dict().get("status") == "active")


def _arrival_rate(office_id: str) -> float | None:
    """
    lambda = check-ins in last ARRIVAL_RATE_WINDOW_MINUTES / window_length
    Returns None if fewer than 3 data points (not enough signal).
    """
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=ARRIVAL_RATE_WINDOW_MINUTES)
    checkins = (
        db.collection("offices")
        .document(office_id)
        .collection("checkins")
        .where("timestamp", ">=", cutoff)
        .stream()
    )
    count = sum(1 for c in checkins if c.to_dict().get("status") == "active")
    if count < 3:
        return None
    return count / ARRIVAL_RATE_WINDOW_MINUTES   # people per minute


def _is_rate_limited(office_id: str, session_id: str) -> bool:
    """
    Check if this anonymous session already checked in recently.
    No account needed — just a browser-generated session ID.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=RATE_LIMIT_WINDOW_MINUTES)
    # Query by session_id only, filter timestamp in Python
    existing = (
        db.collection("offices")
        .document(office_id)
        .collection("checkins")
        .where("session_id", "==", session_id)
        .stream()
    )
    for doc in existing:
        d = doc.to_dict()
        ts = d.get("timestamp")
        if ts and ts >= cutoff:
            return True
    return False


# ─── Public API ───────────────────────────────────────────────────────────────

def get_nearby_offices(lat: float, lng: float, radius: float = 20) -> list:
    docs = db.collection("offices").stream()
    result = []
    for doc in docs:
        d = doc.to_dict()
        dist = haversine(lat, lng, d.get("lat", 0), d.get("lng", 0))
        if dist <= radius:
            live_count = _active_checkin_count(doc.id)
            result.append({
                "office_id": doc.id,
                "name": d["name"],
                "type": d["type"],
                "city": d["city"],
                "area": d.get("area", ""),
                "lat": d.get("lat", 0),
                "lng": d.get("lng", 0),
                "distance_km": dist,
                "current_count": live_count,
            })
    result.sort(key=lambda x: x["distance_km"])
    return result


def get_all_offices() -> list:
    docs = db.collection("offices").stream()
    result = []
    for doc in docs:
        d = doc.to_dict()
        live_count = _active_checkin_count(doc.id)
        result.append({
            "office_id": doc.id,
            "name": d["name"],
            "type": d["type"],
            "city": d["city"],
            "area": d.get("area", ""),
            "lat": d.get("lat", 0),
            "lng": d.get("lng", 0),
            "current_count": live_count,
        })
    return result


def get_queue_data(office_id: str) -> dict | None:
    doc = db.collection("offices").document(office_id).get()
    if not doc.exists:
        return None
    d = doc.to_dict()
    d["current_count"] = _active_checkin_count(office_id)
    d["arrival_rate"] = _arrival_rate(office_id)
    return d


def checkin_user(office_id: str, session_id: str) -> dict:
    """
    Returns {"success": bool, "reason": str}
    Reason is "ok", "rate_limited", or "not_found".
    """
    ref = db.collection("offices").document(office_id)
    if not ref.get().exists:
        return {"success": False, "reason": "not_found"}

    if _is_rate_limited(office_id, session_id):
        return {"success": False, "reason": "rate_limited"}

    ref.collection("checkins").add({
        "timestamp": datetime.now(timezone.utc),
        "status": "active",
        "session_id": session_id,
    })
    return {"success": True, "reason": "ok"}


def checkout_user(office_id: str, session_id: str) -> bool:
    """Mark the most recent active checkin for this session as left."""
    ref = db.collection("offices").document(office_id)
    if not ref.get().exists:
        return False

    cutoff = datetime.now(timezone.utc) - timedelta(minutes=CHECKIN_WINDOW_MINUTES)
    results = (
        ref.collection("checkins")
        .where("session_id", "==", session_id)
        .where("timestamp", ">=", cutoff)
        .where("status", "==", "active")
        .order_by("timestamp", direction=firestore.Query.DESCENDING)
        .limit(1)
        .stream()
    )
    for doc in results:
        doc.reference.update({"status": "left"})
        return True
    return False
