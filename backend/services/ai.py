import google.generativeai as genai
from dotenv import load_dotenv
from services.firebase import get_all_offices, get_queue_data
import os
import json

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# ─────────────────────────────────────────
# FEATURE A — Natural Language Search
# ─────────────────────────────────────────

async def natural_search(query: str) -> dict:
    offices = get_all_offices()
    offices_text = "\n".join([
        f"- ID: {o['office_id']} | Name: {o['name']} | "
        f"Type: {o['type']} | City: {o['city']} | "
        f"Queue: {o['current_count']} people"
        for o in offices
    ])

    prompt = f"""
You are a helpful assistant for QJan — a government office queue predictor app in India.

User query: "{query}"

Available offices:
{offices_text}

Based on the user's query, return ONLY a JSON object like this:
{{
  "matched_office_id": "rto_andheri",
  "reason": "One line explanation why this office matches",
  "confidence": "high/medium/low"
}}

If no office matches, return:
{{
  "matched_office_id": null,
  "reason": "No matching office found",
  "confidence": "low"
}}

Return ONLY the JSON. No extra text.
"""
    response = model.generate_content(prompt)
    text = response.text.strip().replace("```json","").replace("```","")
    return json.loads(text)


# ─────────────────────────────────────────
# FEATURE B — Anomaly Explainer
# ─────────────────────────────────────────

async def explain_anomaly(office_id: str) -> dict:
    data = get_queue_data(office_id)
    if not data:
        return {"anomaly": False, "message": "Office not found"}

    current = data["current_count"]
    history = data.get("history", {})

    from datetime import datetime
    today = datetime.now().strftime("%A").lower()
    hour_index = min(
        max(datetime.now().hour - 9, 0), 5
    )
    slots = ["9am","10am","11am","12pm","2pm","3pm"]
    current_slot = slots[hour_index]

    historical_avg = 0
    if today in history:
        historical_avg = history[today][hour_index]

    prompt = f"""
You are an AI assistant for QJan — a government office queue predictor in India.

Office: {data['name']}
Current queue count: {current} people
Current time slot: {current_slot}
Historical average for this slot on {today}: {historical_avg} people

Analyze if this is an anomaly and explain in simple Indian English.

Return ONLY a JSON object:
{{
  "anomaly": true or false,
  "severity": "low/medium/high",
  "message": "One friendly sentence explaining the situation to the user",
  "suggestion": "One actionable suggestion for the user"
}}

Return ONLY the JSON. No extra text.
"""
    response = model.generate_content(prompt)
    text = response.text.strip().replace("```json","").replace("```","")
    result = json.loads(text)
    result["current_count"] = current
    result["historical_avg"] = historical_avg
    return result


# ─────────────────────────────────────────
# FEATURE C — Smart Visit Planner
# ─────────────────────────────────────────

async def plan_visit(office_id: str, free_slots: list[str]) -> dict:
    data = get_queue_data(office_id)
    if not data:
        return {"recommendation": None, "reason": "Office not found"}

    history = data.get("history", {})
    history_text = json.dumps(history, indent=2)

    slots_text = ", ".join(free_slots)

    prompt = f"""
You are a smart visit planner for QJan — a government office queue app in India.

Office: {data['name']}
User's available slots: {slots_text}

Historical queue data (day → [9am,10am,11am,12pm,2pm,3pm] counts):
{history_text}

Based on historical data, recommend the BEST slot for the user to visit.

Return ONLY a JSON object:
{{
  "recommended_slot": "Thursday 2pm",
  "expected_count": 8,
  "reason": "Friendly one sentence explanation",
  "alternative_slot": "Tuesday 11am",
  "tip": "One practical tip for the visit"
}}

Return ONLY the JSON. No extra text.
"""
    response = model.generate_content(prompt)
    text = response.text.strip().replace("```json","").replace("```","")
    return json.loads(text)