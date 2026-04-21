from fastapi import APIRouter, HTTPException
from services.firebase import get_queue_data, checkin_user, checkout_user
from services.predictor import calculate_wait_time, get_best_time, get_status

router = APIRouter()

#Get live queue info for an office

@router.get("/{office_id}")
async def get_queue(office_id: str):
    data = get_queue_data(office_id)
     
    if not data:
        raise HTTPException(status_code=404, detail="Office not found")
    
    wait_time = calculate_wait_time(
        data["current_count"],
        data["avg_service_time"]    
    )
    
    best_time = get_best_time(data["history"])
    
    return {
        "office_id": office_id,
        "name": data["name"],
        "type": data["type"],
        "current_count": data["current_count"],
        "estimated_wait_mins": wait_time,
        "status": get_status(data["current_count"]),
        "best_time_today": best_time
    }
    
# User joins queue
@router.post("/{office_id}/checkin")
async def checkin(office_id: str):
    success = checkin_user(office_id)
    if not success:
        raise HTTPException(status_code=404, detail="Office not found")
    return {
        "message": "Checked in successfully ✅",
        "office_id": office_id
    }
    
# User leaves queue
@router.post("/{office_id}/checkout")
async def checkout(office_id: str):
    success = checkout_user(office_id)
    if not success:
        raise HTTPException(status_code=404, detail="Office not found")
    return {
        "message": "Checked out ✅",
        "office_id": office_id
    }

# Get all offices
@router.get("/")
async def get_all_offices():
    from data.mock_data import OFFICES
    return [
        {
            "office_id": key,
            "name": val["name"],
            "type": val["type"],
            "city": val["city"],
            "status": get_status(val["current_count"])
        }
        for key, val in OFFICES.items()
    ]