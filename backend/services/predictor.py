from datetime import datetime


# ─── M/M/1 Queuing Theory ────────────────────────────────────────────────────
#
#  W  =  1 / (mu - lambda)
#
#  lambda  = arrival rate (people / min)  — derived from recent check-ins
#  mu      = service rate (people / min)  = 1 / avg_service_time
#  W       = expected total wait (queue wait + service)
#
#  If lambda >= mu the queue is unstable — we return None to signal this.
# ─────────────────────────────────────────────────────────────────────────────

def calculate_wait_time(
    current_count: int,
    avg_service_time: float,
    arrival_rate: float | None = None,
) -> dict:
    """
    Returns:
        {
            "wait_mins": int | None,   # None means queue is unstable
            "utilisation": float,      # 0.0 – 1.0+  (rho = lambda / mu)
            "stable": bool,
            "model": "mm1" | "fallback"
        }
    """
    mu = 1.0 / avg_service_time if avg_service_time > 0 else 1.0 / 4.5

    # If we have a real arrival rate use M/M/1, else fall back to simple estimate
    if arrival_rate is not None and arrival_rate > 0:
        lam = arrival_rate
        rho = lam / mu

        if rho >= 1.0:
            # Unstable queue — wait time → ∞
            return {
                "wait_mins": None,
                "utilisation": round(rho, 2),
                "stable": False,
                "model": "mm1",
            }

        # W = 1 / (mu - lambda)  [expected time in system, minutes]
        W = 1.0 / (mu - lam)
        return {
            "wait_mins": round(W),
            "utilisation": round(rho, 2),
            "stable": True,
            "model": "mm1",
        }

    # Fallback when we don't yet have enough check-in data for lambda
    # Simple: current_count * avg_service_time  (old formula, no fake buffer)
    wait = round(current_count * avg_service_time)
    return {
        "wait_mins": wait,
        "utilisation": None,
        "stable": True,
        "model": "fallback",
    }


def get_best_time(history: dict) -> dict:
    """
    Returns the quietest future slot for today.
    Never suggests a slot that has already passed.
    Falls back to overall average if today has no history.
    """
    slots = ["9am", "10am", "11am", "12pm", "2pm", "3pm"]

    # Slot start hours (24h) for "has this passed?" check
    slot_hours = {
        "9am": 9, "10am": 10, "11am": 11,
        "12pm": 12, "2pm": 14, "3pm": 15,
    }

    now = datetime.now()
    current_hour = now.hour
    today_key = now.strftime("%A").lower()  # e.g. "monday"

    # Pick today's data, or fall back to any available day
    if today_key in history:
        today_data = history[today_key]
        data_source = today_key
    else:
        # Average across all available days
        all_days = list(history.values())
        if not all_days:
            return {"time": "2pm", "expected_count": 5, "confidence": "low"}
        today_data = [
            sum(day[i] for day in all_days) / len(all_days)
            for i in range(len(slots))
        ]
        data_source = "average"

    # Only consider future slots
    future_slots = [
        (slot, today_data[i])
        for i, slot in enumerate(slots)
        if i < len(today_data) and slot_hours[slot] > current_hour
    ]

    if not future_slots:
        # All slots have passed today — return overall quietest for planning
        best_idx = today_data.index(min(today_data))
        return {
            "time": slots[best_idx],
            "expected_count": round(today_data[best_idx]),
            "confidence": "low" if data_source == "average" else "medium",
            "note": "All slots today have passed. Showing best slot for reference.",
        }

    best_slot, best_count = min(future_slots, key=lambda x: x[1])

    return {
        "time": best_slot,
        "expected_count": round(best_count),
        "confidence": "low" if data_source == "average" else "medium",
    }


def get_status(count: int) -> str:
    if count <= 10:
        return "quiet"
    elif count <= 25:
        return "moderate"
    else:
        return "busy"


def get_anomaly_status(current_count: int, utilisation: float | None) -> dict:
    """
    Uses utilisation (rho) from M/M/1 as the anomaly signal when available.
    Falls back to count-based thresholds otherwise.
    """
    if utilisation is not None:
        if utilisation >= 0.85:
            return {
                "anomaly": True,
                "severity": "high",
                "message": "Queue is near capacity. Wait times will rise sharply.",
            }
        if utilisation <= 0.20:
            return {
                "anomaly": True,
                "severity": "low",
                "message": "Much quieter than usual. Great time to visit.",
            }
        return {"anomaly": False, "message": "Normal queue for this time."}

    # Fallback thresholds when no utilisation data
    if current_count > 30:
        return {
            "anomaly": True,
            "severity": "high",
            "message": "Queue is much higher than usual for this time.",
        }
    if current_count <= 3:
        return {
            "anomaly": True,
            "severity": "low",
            "message": "Much quieter than usual. Great time to visit.",
        }
    return {"anomaly": False, "message": "Normal queue for this time."}
