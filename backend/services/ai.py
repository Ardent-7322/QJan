from groq import Groq
from dotenv import load_dotenv
from services.firebase import get_all_offices, get_queue_data
import time

# ── Simple in-memory cache for AI search responses ────────────────────────────
# Avoids hitting Groq API for repeated common queries like "passport" or "RTO"
_search_cache: dict[str, dict] = {}
_CACHE_TTL_SECONDS = 300  # 5 minutes
import os
import json
import re

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def clean_json(text: str) -> str:
    # Remove markdown backticks
    text = text.replace("```json", "").replace("```", "").strip()
    # Extract only the JSON object
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return match.group(0)
    return text

def ask_groq(prompt: str) -> str:
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise RuntimeError(f"AI service unavailable: {str(e)}")

# ─────────────────────────────────────────
# FEATURE A — Natural Language Search
# ─────────────────────────────────────────

async def natural_search(query: str) -> dict:
    # Check cache first
    cache_key = query.strip().lower()
    if cache_key in _search_cache:
        entry = _search_cache[cache_key]
        if time.time() - entry["cached_at"] < _CACHE_TTL_SECONDS:
            return entry["result"]

    try:
        offices = get_all_offices()
    except Exception:
        return {"matched_office_id": None, "reason": "Service temporarily unavailable", "confidence": "low"}
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

Based on the user query, return ONLY a JSON object like this:
{{
  "matched_office_id": "rto_andheri",
  "reason": "One line explanation why this office matches",
  "confidence": "high"
}}

If no office matches return:
{{
  "matched_office_id": null,
  "reason": "No matching office found",
  "confidence": "low"
}}

Return ONLY raw JSON. No markdown. No backticks. No explanation.
"""
    text = ask_groq(prompt)
    # Clean any accidental markdown
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(clean_json(text)) 


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
    hour_index = min(max(datetime.now().hour - 9, 0), 5)
    slots = ["9am", "10am", "11am", "12pm", "2pm", "3pm"]
    current_slot = slots[hour_index]

    historical_avg = 0
    if today in history:
        historical_avg = history[today][hour_index]

    # Find quieter slots from history for suggestion
    quieter_slots = []
    if today in history:
        slot_names = ["9am", "10am", "11am", "12pm", "2pm", "3pm"]
        for i, count in enumerate(history[today]):
            if count < historical_avg * 0.6 and i < len(slot_names):
                quieter_slots.append(f"{slot_names[i]} (~{count} people)")
    quieter_text = ", ".join(quieter_slots[:2]) if quieter_slots else "2pm or 3pm"

    prompt = f"""
You are an AI assistant for QJan — a government office queue predictor in India.

Office: {data['name']}
Current queue count: {current} people
Current time slot: {current_slot}
Historical average for this slot on {today}: {historical_avg} people
Historically quieter slots today: {quieter_text}

Analyze if this is an anomaly and explain in simple friendly English.
If it IS an anomaly, the suggestion MUST recommend a specific quieter time slot from the data above.

Return ONLY a raw JSON object like this:
{{
  "anomaly": true,
  "severity": "high",
  "message": "Queue is much higher than usual for this time.",
  "suggestion": "Try visiting at 2pm — historically only 5 people at that time."
}}

Return ONLY raw JSON. No markdown. No backticks. No explanation.
"""
    text = ask_groq(prompt)
    text = text.replace("```json", "").replace("```", "").strip()
    result = json.loads(clean_json(text)) 
    result["current_count"] = current
    result["historical_avg"] = historical_avg
    return result


# ─────────────────────────────────────────
# FEATURE C — Visit Planner
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

Historical queue data (day → [9am, 10am, 11am, 12pm, 2pm, 3pm] counts):
{history_text}

Based on historical data recommend the BEST slot for the user.

Return ONLY a raw JSON object like this:
{{
  "recommended_slot": "Thursday 2pm",
  "expected_count": 8,
  "reason": "Thursday afternoons historically have the lowest queue.",
  "alternative_slot": "Tuesday 11am",
  "tip": "Carry all documents to avoid multiple visits."
}}

Return ONLY raw JSON. No markdown. No backticks. No explanation.
"""
    text = ask_groq(prompt)
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(clean_json(text))