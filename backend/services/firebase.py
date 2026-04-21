#Mock for now - firebase is not being used yet in the backend, but this will be used in the future when we need to integrate with firebase for authentication and database services.

from data.mock_data import OFFICES

def get_queue_data(office_id: str) -> dict:
    if office_id not in OFFICES:
        return None
    return OFFICES[office_id]

def checkin_user(office_id: str, user_id: str) -> bool:
    if office_id not in OFFICES:
        return False
    OFFICES[office_id]["current_count"] += 1
    return True

def checkout_user(office_id: str, user_id: str) -> bool:
    if office_id not in OFFICES :
        return False
    if OFFICES[office_id]["current_count"] > 0:
        OFFICES[office_id]["current_count"] -= 1
    return True