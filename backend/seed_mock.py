"""
Run this to add mock active check-ins for demo:
    python seed_mock.py

Re-run every 20 minutes — check-ins expire after 20 min window.
"""
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta, timezone
import random
import sys
import os

# Init Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

MOCK_QUEUE = {
    "rto_jobner":                   12,
    "phulera_govt_hospital_opd":    18,
    "post_office_phulera":           7,
    "passport_seva_jaipur":          5,
    "rto_delhi_saket":              15,
    "rto_delhi_rohini":              9,
    "passport_delhi_patiala_house": 11,
    "passport_delhi_dwarka":         6,
    "aiims_delhi_opd":              24,
    "gtb_hospital_delhi":           14,
    "post_office_connaught":         8,
    "post_office_lajpat":            4,
}

def seed_mock():
    now = datetime.now(timezone.utc)
    total = 0
    for office_id, count in MOCK_QUEUE.items():
        ref = db.collection("offices").document(office_id)
        if not ref.get().exists:
            print(f"  Skipping {office_id} — not in Firestore")
            continue
        for i in range(count):
            mins_ago = random.uniform(0, 15)
            ts = now - timedelta(minutes=mins_ago)
            ref.collection("checkins").add({
                "timestamp": ts,
                "status": "active",
                "session_id": f"mock_{office_id}_{i}_{int(now.timestamp())}",
            })
        print(f"  {office_id}: {count} checkins")
        total += count
    print(f"\n✅ {total} mock checkins added! They expire in 20 mins.")

if __name__ == "__main__":
    seed_mock()
