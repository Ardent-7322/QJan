# QJan

You leave home to get your driving license renewed. You reach the RTO. There are 60 people ahead of you. Nobody told you. You wait 3 hours for work that takes 5 minutes.

QJan fixes this. Check the queue before you leave.

---

## What it does

- Shows how many people are currently at any office
- Tells you how long you will roughly wait
- Suggests the best time to visit today based on past patterns
- Warns you if the queue is unusually high or low
- Lets you plan your visit by picking your free time slots

No account needed. No personal data collected. Just open, check, and go.

---

## How it works

Everyone who visits an office taps "I'm here now" when they arrive. That anonymous check-in updates the live count for everyone else. The more people use it, the more accurate it gets.

**Wait time** is calculated using M/M/1 queuing theory - a standard formula used in operations research that accounts for how fast people are arriving vs how fast the office is serving them. It is more accurate than a simple multiply-and-guess approach, especially when queues are growing.

**Best time** looks at historical check-in patterns for that office on the same day of the week and finds the quietest future slot. It never suggests a time that has already passed.

**Anomaly detection** triggers when the queue reaches 85% of the office's service capacity - the point where wait times start rising sharply. It then tells you the next quietest slot to visit instead.

---

## Tech used

| Part | What |
|---|---|
| Frontend | React + TypeScript |
| Backend | Python + FastAPI |
| AI | Groq - Llama 3.1 8B |
| Database | Firebase Firestore |

The AI handles natural language search (so you can type "renew my license" instead of knowing which office does what) and the visit planner (picks the best slot from your free time).

---

## Pros

- Works without any government involvement or approval
- Fully anonymous - no account, no phone number, no tracking
- Gets more accurate as more people use it
- AI search means you do not need to know which office handles what
- Queuing theory gives honest estimates - shows "queue is growing" instead of a fake number when things are unstable

## Cons

- Accuracy depends on how many people are actively checking in - early days will have low confidence
- Browser notifications need an open tab, no background support
- Not a native app, so some mobile features are limited

---

## Running locally

**Backend**
```bash
cd backend
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

Add a `.env` file in `backend/`:
