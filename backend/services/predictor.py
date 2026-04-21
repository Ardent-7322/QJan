from datetime import datetime

def calculate_wait_time(current_count : int, avg_service_time : float) -> int:
    raw_wait_time = current_count * avg_service_time
    buffered_wait_time = raw_wait_time * 1.10  # Adding a buffer of 10% minutes --> chai break
    return round(buffered_wait_time)


def get_best_time(history : dict) -> str:
    today = datetime.now().strftime("%A").lower()  # Get current day of the week
    slots = ["9am", "10am", "11am", "12pm", "2pm", "3pm"]
    
    if today not in history :
        today = "monday"  # Default to Monday if today's data is not available ==> fallback
        
    today_data = history[today]
    min_count = min(today_data)
    best_slot_index = today_data.index(min_count)
    
    return {
        "time" : slots[best_slot_index],
        "expected_count" : min_count
    }
    
def get_status(count: int) -> str:
    if count <= 10:
        return "quiet 🟢"
    elif count <= 25:
        return "moderate 🟡"
    else:
        return "busy 🔴"