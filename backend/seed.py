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