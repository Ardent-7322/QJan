import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

OFFICES = [
    {
        "id": "rto_jaipur_main",
        "name": "RTO Jaipur — Chomu Road",
        "type": "RTO",
        "city": "Jaipur",
        "area": "Civil Lines",
        "lat": 26.9342,
        "lng": 75.7897,
        "current_count": 23,
        "avg_service_time": 4.5,
        "history": {
            "monday":    [45, 38, 22, 12, 8, 15],
            "tuesday":   [40, 35, 20, 10, 7, 12],
            "wednesday": [42, 33, 18, 11, 9, 14],
            "thursday":  [38, 30, 17, 10, 6, 11],
            "friday":    [50, 42, 25, 14, 10, 18],
        }
    },
    {
        "id": "passport_seva_jaipur",
        "name": "Passport Seva Kendra Jaipur",
        "type": "Passport",
        "city": "Jaipur",
        "area": "Lal Kothi",
        "lat": 26.8954,
        "lng": 75.8089,
        "current_count": 8,
        "avg_service_time": 6.0,
        "history": {
            "monday":    [30, 25, 15, 8, 5, 10],
            "tuesday":   [28, 22, 14, 7, 4,  9],
            "wednesday": [32, 27, 16, 9, 6, 11],
            "thursday":  [25, 20, 12, 6, 3,  8],
            "friday":    [35, 30, 18, 10, 7, 12],
        }
    },
    {
        "id": "sms_hospital_jaipur",
        "name": "SMS Hospital OPD",
        "type": "Hospital",
        "city": "Jaipur",
        "area": "Tonk Road",
        "lat": 26.9054,
        "lng": 75.7982,
        "current_count": 41,
        "avg_service_time": 3.0,
        "history": {
            "monday":    [60, 55, 40, 25, 15, 20],
            "tuesday":   [55, 50, 38, 22, 12, 18],
            "wednesday": [58, 52, 39, 23, 13, 19],
            "thursday":  [50, 45, 35, 20, 10, 15],
            "friday":    [65, 60, 45, 28, 18, 22],
        }
    },
    {
        "id": "jaipur_gpo",
        "name": "Jaipur GPO",
        "type": "Post Office",
        "city": "Jaipur",
        "area": "MI Road",
        "lat": 26.9196,
        "lng": 75.8122,
        "current_count": 12,
        "avg_service_time": 5.0,
        "history": {
            "monday":    [20, 18, 12, 8, 5, 9],
            "tuesday":   [18, 15, 10, 7, 4, 8],
            "wednesday": [22, 19, 13, 9, 6, 10],
            "thursday":  [17, 14,  9, 6, 3, 7],
            "friday":    [25, 22, 15, 10, 7, 11],
        }
    },
    {
        "id": "rto_jobner",
        "name": "RTO Jobner",
        "type": "RTO",
        "city": "Jaipur",
        "area": "Jobner",
        "lat": 26.9721,
        "lng": 75.3842,
        "current_count": 15,
        "avg_service_time": 4.5,
        "history": {
            "monday":    [25, 20, 15, 8, 5, 10],
            "tuesday":   [22, 18, 12, 7, 4,  8],
            "wednesday": [24, 19, 13, 8, 6,  9],
            "thursday":  [20, 16, 11, 6, 3,  7],
            "friday":    [28, 22, 16, 9, 6, 11],
        }
    },
    {
        "id": "govt_hospital_phulera",
        "name": "Phulera Govt Hospital OPD",
        "type": "Hospital",
        "city": "Jaipur",
        "area": "Phulera",
        "lat": 26.8723,
        "lng": 75.2341,
        "current_count": 18,
        "avg_service_time": 3.0,
        "history": {
            "monday":    [35, 30, 22, 15, 8, 12],
            "tuesday":   [30, 25, 18, 12, 6, 10],
            "wednesday": [32, 27, 20, 13, 7, 11],
            "thursday":  [28, 23, 16, 10, 5,  9],
            "friday":    [38, 32, 24, 16, 9, 13],
        }
    },
    {
        "id": "post_office_phulera",
        "name": "Post Office Phulera",
        "type": "Post Office",
        "city": "Jaipur",
        "area": "Phulera",
        "lat": 26.8698,
        "lng": 75.2318,
        "current_count": 7,
        "avg_service_time": 5.0,
        "history": {
            "monday":    [15, 12, 8, 5, 3, 6],
            "tuesday":   [12, 10, 7, 4, 2, 5],
            "wednesday": [14, 11, 8, 5, 3, 6],
            "thursday":  [11,  9, 6, 4, 2, 4],
            "friday":    [16, 13, 9, 6, 4, 7],
        }
    },
    {
        "id": "tahsildar_sanganer",
        "name": "Tahsildar Office Sanganer",
        "type": "Tahsildar",
        "city": "Jaipur",
        "area": "Sanganer",
        "lat": 26.8121,
        "lng": 75.8012,
        "current_count": 9,
        "avg_service_time": 7.0,
        "history": {
            "monday":    [20, 18, 12, 8, 5, 9],
            "tuesday":   [18, 15, 10, 7, 4, 8],
            "wednesday": [22, 19, 13, 9, 6, 10],
            "thursday":  [17, 14,  9, 6, 3, 7],
            "friday":    [25, 22, 15, 10, 7, 11],
        }
    },
    {
        "id": "rto_chaksu",
        "name": "RTO Chaksu",
        "type": "RTO",
        "city": "Jaipur",
        "area": "Chaksu",
        "lat": 26.6123,
        "lng": 75.9512,
        "current_count": 11,
        "avg_service_time": 4.5,
        "history": {
            "monday":    [22, 18, 13, 8, 4, 9],
            "tuesday":   [20, 16, 11, 7, 3, 8],
            "wednesday": [21, 17, 12, 8, 4, 9],
            "thursday":  [18, 14, 10, 6, 3, 7],
            "friday":    [25, 20, 14, 9, 5, 10],
        }
    },
    {
        "id": "post_office_amber",
        "name": "Post Office Amber",
        "type": "Post Office",
        "city": "Jaipur",
        "area": "Amber",
        "lat": 26.9855,
        "lng": 75.8513,
        "current_count": 4,
        "avg_service_time": 5.0,
        "history": {
            "monday":    [12, 10, 7, 4, 2, 5],
            "tuesday":   [10,  8, 6, 3, 2, 4],
            "wednesday": [11,  9, 7, 4, 2, 5],
            "thursday":  [ 9,  7, 5, 3, 1, 4],
            "friday":    [13, 11, 8, 5, 3, 6],
        }
    }
]

def seed():
    for office in OFFICES:
        office_id = office.pop("id")
        ref = db.collection("offices").document(office_id)
        if not ref.get().exists:
            ref.set(office)
            print(f"Added: {office_id}")
        else:
            print(f"Already exists: {office_id}")
    print("\nDone! All offices in Firebase.")

if __name__ == "__main__":
    seed()
# ── Delhi offices — run this to add Delhi data ────────────────────────────────
DELHI_OFFICES = [
    {
        "id": "rto_delhi_saket",
        "name": "RTO Delhi, Saket",
        "type": "RTO",
        "city": "Delhi",
        "area": "Saket",
        "lat": 28.5244,
        "lng": 77.2066,
        "avg_service_time": 5.0,
        "history": {
            "monday":    [50, 42, 28, 15, 10, 18],
            "tuesday":   [45, 38, 24, 12, 8, 15],
            "wednesday": [48, 40, 26, 14, 9, 16],
            "thursday":  [42, 35, 22, 11, 7, 13],
            "friday":    [55, 48, 30, 16, 12, 20],
        }
    },
    {
        "id": "rto_delhi_rohini",
        "name": "RTO Delhi, Rohini",
        "type": "RTO",
        "city": "Delhi",
        "area": "Rohini Sector 3",
        "lat": 28.7041,
        "lng": 77.1025,
        "avg_service_time": 4.5,
        "history": {
            "monday":    [40, 35, 22, 12, 8, 14],
            "tuesday":   [38, 32, 20, 10, 6, 12],
            "wednesday": [42, 36, 23, 13, 9, 15],
            "thursday":  [35, 30, 18, 10, 5, 11],
            "friday":    [48, 42, 27, 15, 10, 17],
        }
    },
    {
        "id": "passport_delhi_patiala_house",
        "name": "Passport Seva Kendra, Patiala House",
        "type": "Passport",
        "city": "Delhi",
        "area": "Patiala House",
        "lat": 28.6198,
        "lng": 77.2411,
        "avg_service_time": 6.0,
        "history": {
            "monday":    [35, 28, 18, 9, 6, 11],
            "tuesday":   [30, 25, 16, 8, 5, 10],
            "wednesday": [33, 27, 17, 9, 6, 11],
            "thursday":  [28, 22, 14, 7, 4,  9],
            "friday":    [40, 32, 20, 11, 7, 13],
        }
    },
    {
        "id": "passport_delhi_dwarka",
        "name": "Passport Seva Kendra, Dwarka",
        "type": "Passport",
        "city": "Delhi",
        "area": "Dwarka Sector 10",
        "lat": 28.5823,
        "lng": 77.0500,
        "avg_service_time": 6.0,
        "history": {
            "monday":    [32, 26, 17, 8, 5, 10],
            "tuesday":   [28, 23, 15, 7, 4,  9],
            "wednesday": [30, 25, 16, 8, 5, 10],
            "thursday":  [26, 21, 13, 6, 3,  8],
            "friday":    [37, 30, 19, 10, 6, 12],
        }
    },
    {
        "id": "aiims_delhi_opd",
        "name": "AIIMS OPD, New Delhi",
        "type": "Hospital",
        "city": "Delhi",
        "area": "Ansari Nagar",
        "lat": 28.5672,
        "lng": 77.2100,
        "avg_service_time": 3.5,
        "history": {
            "monday":    [80, 70, 55, 35, 20, 25],
            "tuesday":   [75, 65, 50, 30, 18, 22],
            "wednesday": [78, 68, 52, 32, 19, 24],
            "thursday":  [70, 60, 46, 28, 16, 20],
            "friday":    [85, 75, 58, 38, 22, 28],
        }
    },
    {
        "id": "gtb_hospital_delhi",
        "name": "GTB Hospital OPD",
        "type": "Hospital",
        "city": "Delhi",
        "area": "Dilshad Garden",
        "lat": 28.6812,
        "lng": 77.3090,
        "avg_service_time": 3.0,
        "history": {
            "monday":    [65, 58, 44, 28, 16, 21],
            "tuesday":   [60, 52, 40, 25, 14, 19],
            "wednesday": [63, 55, 42, 26, 15, 20],
            "thursday":  [55, 48, 37, 22, 12, 17],
            "friday":    [70, 62, 47, 30, 18, 23],
        }
    },
    {
        "id": "post_office_connaught",
        "name": "GPO Connaught Place",
        "type": "Post Office",
        "city": "Delhi",
        "area": "Connaught Place",
        "lat": 28.6315,
        "lng": 77.2167,
        "avg_service_time": 4.0,
        "history": {
            "monday":    [30, 25, 18, 10, 7, 12],
            "tuesday":   [28, 22, 16, 9, 6, 11],
            "wednesday": [32, 26, 19, 11, 7, 13],
            "thursday":  [25, 20, 14, 8, 5, 10],
            "friday":    [38, 32, 22, 12, 8, 15],
        }
    },
    {
        "id": "post_office_lajpat",
        "name": "Post Office — Lajpat Nagar",
        "type": "Post Office",
        "city": "Delhi",
        "area": "Lajpat Nagar",
        "lat": 28.5706,
        "lng": 77.2400,
        "avg_service_time": 3.5,
        "history": {
            "monday":    [22, 18, 13, 7, 5,  9],
            "tuesday":   [20, 16, 12, 6, 4,  8],
            "wednesday": [24, 19, 14, 8, 5, 10],
            "thursday":  [18, 15, 11, 6, 3,  7],
            "friday":    [28, 24, 16, 9, 6, 12],
        }
    },
]

def seed_delhi():
    for office in DELHI_OFFICES:
        office_id = office.pop("id")
        office["current_count"] = 0
        db.collection("offices").document(office_id).set(office)
        print(f"Seeded: {office['name']}")
    print(f"\n✅ {len(DELHI_OFFICES)} Delhi offices seeded successfully!")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "delhi":
        seed_delhi()
    else:
        # Original seed
        for office in OFFICES:
            office_id = office.pop("id")
            db.collection("offices").document(office_id).set(office)
            print(f"Seeded: {office['name']}")
        print("✅ All offices seeded!")


def seed_mock_checkins():
    """
    Seed realistic mock check-ins for demo purposes.
    Creates check-ins within last 20 minutes so they show as active queue.
    Run this after seeding offices: python seed.py mock
    """
    from datetime import datetime, timedelta, timezone
    import random

    # office_id -> how many active people to simulate
    MOCK_QUEUE = {
        "rto_jobner":                    12,
        "phulera_govt_hospital_opd":     18,
        "post_office_phulera":           7,
        "passport_seva_jaipur":          5,
        "rto_delhi_saket":               15,
        "rto_delhi_rohini":              9,
        "passport_delhi_patiala_house":  11,
        "passport_delhi_dwarka":         6,
        "aiims_delhi_opd":               24,
        "gtb_hospital_delhi":            14,
        "post_office_connaught":         8,
        "post_office_lajpat":            4,
    }

    now = datetime.now(timezone.utc)
    total = 0
    for office_id, count in MOCK_QUEUE.items():
        ref = db.collection("offices").document(office_id)
        if not ref.get().exists:
            print(f"  Skipping {office_id} — not found")
            continue
        for i in range(count):
            # Spread check-ins over last 15 minutes
            mins_ago = random.uniform(0, 15)
            ts = now - timedelta(minutes=mins_ago)
            ref.collection("checkins").add({
                "timestamp": ts,
                "status": "active",
                "session_id": f"seed_mock_{office_id}_{i}",
            })
        print(f"  {office_id}: {count} checkins added")
        total += count
    print(f"\n✅ {total} mock checkins seeded across {len(MOCK_QUEUE)} offices!")
    print("   These expire in 20 minutes — re-run to refresh.")


if __name__ == "__main__":
    import sys
    arg = sys.argv[1] if len(sys.argv) > 1 else ""
    if arg == "delhi":
        seed_delhi()
    elif arg == "mock":
        seed_mock_checkins()
    else:
        for office in OFFICES:
            office_id = office.pop("id")
            db.collection("offices").document(office_id).set(office)
            print(f"Seeded: {office['name']}")
        print("✅ All offices seeded!")
