# QJan

QJan helps you check how long the queue is at government offices before you leave home. No more wasting hours standing in line without knowing when your turn will come.

---

## Problem

People visit offices like RTO, Passport Seva, hospitals, and post offices without any idea how crowded it is. Sometimes you wait 3 hours for work that takes 5 minutes. There is no system, no display board, no way to know.

QJan fixes this.

---

## Features

| Feature | What it does |
|---|---|
| Live Queue Count | Updates every 10 seconds so you always see the current situation |
| Wait Time Prediction | Tells you roughly how long you will wait based on people ahead |
| Best Time Suggester | Finds the quietest slot to visit today based on historical data |
| AI Search | Type what you need in plain words and it finds the right office |
| AI Anomaly Detector | Notices unusual crowds and tells you what to do |
| AI Visit Planner | You pick your free slots, AI picks the best one |
| Anonymous Check-in | No account, no login, just tap and contribute |
| Surge Alerts | Notifies you when queue drops or spikes while you are on the way |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Backend | Python + FastAPI |
| AI | Groq — Llama 3.1 8B Instant |
| Database | Firebase Firestore |
| Notifications | Browser Notification API + localStorage |

---

## How It Predicts

**Wait time formula**

```
Wait Time = People in Queue x Avg Service Time x 1.1 buffer
```

**Best time logic**

Looks at which hour historically has the lowest queue for that day of the week. No machine learning. Just clean pattern matching on real data.

---

## Pros and Cons

**Pros**

- Works without any government involvement
- Fully anonymous so no privacy concerns
- Gets smarter as more people use it
- AI makes it usable even if you do not know which office handles what
- Surge alerts help when queue changes while you are already travelling

**Cons**

- Accuracy depends on how many people are actively checking in
- Early stage predictions may be off with low user count
- Browser notifications require permission and an open tab
- Not a native app so background features are limited

---

## Getting Started

**Backend**

```powershell
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Create a `.env` file inside `backend/`

```
GROQ_API_KEY=your_key_here
```

**Frontend**

```powershell
cd frontend
npm install
npm start
```

Create a `.env` file inside `frontend/`

```
REACT_APP_API_URL=http://localhost:8000/api/queue
```

API docs available at `http://localhost:8000/docs`
