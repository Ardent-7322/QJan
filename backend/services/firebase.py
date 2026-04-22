import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import math

if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
    return round(R * 2 * math.asin(math.sqrt(a)), 1)

def get_nearby_offices(lat: float, lng: float, radius: float = 20) -> list:
    docs = db.collection("offices").stream()
    result = []
    for doc in docs:
        d = doc.to_dict()
        dist = haversine(lat, lng, d.get("lat", 0), d.get("lng", 0))
        if dist <= radius:
            result.append({
                "office_id": doc.id,
                "name": d["name"],
                "type": d["type"],
                "city": d["city"],
                "area": d.get("area", ""),
                "lat": d.get("lat", 0),
                "lng": d.get("lng", 0),
                "distance_km": dist,
                "current_count": d["current_count"],
            })
    result.sort(key=lambda x: x["distance_km"])
    return result

def get_all_offices() -> list:
    docs = db.collection("offices").stream()
    result = []
    for doc in docs:
        d = doc.to_dict()
        result.append({
            "office_id": doc.id,
            "name": d["name"],
            "type": d["type"],
            "city": d["city"],
            "area": d.get("area", ""),
            "lat": d.get("lat", 0),
            "lng": d.get("lng", 0),
            "current_count": d["current_count"],
        })
    return result

def get_queue_data(office_id: str):
    doc = db.collection("offices").document(office_id).get()
    if not doc.exists:
        return None
    return doc.to_dict()

def checkin_user(office_id: str) -> bool:
    ref = db.collection("offices").document(office_id)
    doc = ref.get()
    if not doc.exists:
        return False
    current = doc.to_dict().get("current_count", 0)
    ref.update({"current_count": current + 1})
    db.collection("offices").document(office_id)\
      .collection("checkins").add({
          "timestamp": datetime.now(),
          "status": "active"
      })
    return True

def checkout_user(office_id: str) -> bool:
    ref = db.collection("offices").document(office_id)
    doc = ref.get()
    if not doc.exists:
        return False
    current = doc.to_dict().get("current_count", 0)
    ref.update({"current_count": max(0, current - 1)})
    return True