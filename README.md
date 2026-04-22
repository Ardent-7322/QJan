# QJan — Government Queue Predictor

> **Jaane se pehle Jaane** — Know before you go.

Crores of Indians waste hours every year standing in government office queues with zero information. QJan solves this by letting citizens check live queue counts, predicted wait times, and the best time to visit — before they leave home.

---

## The Problem

A salaried employee needs to renew his driving license at the RTO. He wakes up early, skips breakfast, drives 40 minutes — only to find 60 people already waiting. No display board. No token system. No way to know.

**3 hours of waiting. 5 minutes of actual work.**

This happens every single day at RTOs, Passport Seva Kendras, government hospitals, post offices, and tahsildar offices across India.

**QJan gives citizens the information that was always their right — but nobody gave them.**

---

## Features

- **Live Queue Counter** — Real-time people count updated every 10 seconds
- **Wait Time Predictor** — Estimates wait based on current count and historical service time
- **Smart Time Suggester** — Shows the best time slot to visit today based on historical patterns
- **AI Natural Language Search** — Type "renew driving license near me" and land on the right office instantly
- **AI Anomaly Detector** — Detects unusual crowd spikes and explains them in plain language
- **AI Visit Planner** — Pick your free slots, AI recommends the historically quietest time
- **Anonymous Check-in** — No account, no login, no data stored. Just tap and contribute
- **Office Watch + Surge Alerts** — Star an office, set a quiet threshold, get browser notifications when queue drops or surges while you are en-route

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Backend | Python + FastAPI |
| AI | Groq API — Llama 3.1 8B Instant |
| Database | Firebase Firestore |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway |

---

## Project Structure

```
QJan/
  backend/
    main.py               — FastAPI app entry point
    routes/
      queue.py            — Queue endpoints
      ai.py               — AI endpoints
    services/
      firebase.py         — Database layer
      predictor.py        — Wait time prediction logic
      ai.py               — Groq AI integration
    data/
      mock_data.py        — Mock office data for development
  frontend/
    src/
      screens/
        Splash.tsx         — Splash screen
        Home.tsx           — Office listing + AI search
        Dashboard.tsx      — Live queue dashboard
      api/
        queue.ts           — API calls
      utils/
        notifications.ts   — Browser notification logic
        watchlist.ts       — localStorage watchlist
        watcher.ts         — Background queue watcher
      types/
        index.ts           — TypeScript type definitions
```

---

## How the Prediction Works

```
Wait Time = People in Queue × Avg Service Time per Person × 1.1 buffer

Best Time = Slot with historically lowest queue count for today's day of week
```

No machine learning required. Clean, explainable math that works with real crowd data.

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Groq API key — free at console.groq.com

---

### Backend Setup

```powershell
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Create `.env` inside `backend/` —

```env
GROQ_API_KEY=your_groq_key_here
```

Start the server —

```powershell
uvicorn main:app --reload
```

Backend runs at http://localhost:8000
Interactive API docs at http://localhost:8000/docs

---

### Frontend Setup

```powershell
cd frontend
npm install
npm start
```

Create `.env` inside `frontend/` —

```env
REACT_APP_API_URL=http://localhost:8000/api/queue
```

Frontend runs at http://localhost:3000

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/queue/` | List all offices with live status |
| GET | `/api/queue/{office_id}` | Live queue + wait time + best time |
| POST | `/api/queue/{office_id}/checkin` | Anonymous check-in |
| POST | `/api/queue/{office_id}/checkout` | Anonymous check-out |
| POST | `/api/ai/search` | Natural language office search |
| GET | `/api/ai/anomaly/{office_id}` | AI anomaly detection |
| POST | `/api/ai/plan` | AI visit planner |

---

## Office Types Supported

- RTO — Regional Transport Office
- Passport Seva Kendra
- Government Hospital OPD
- Post Office
- Tahsildar / Collector Office

---

## Why This Matters

| Pain | QJan's Answer |
|---|---|
| No information before leaving home | Live queue count + predicted wait |
| Wasted half days at wrong times | Historical best time suggestion |
| Confusing which branch to go to | AI natural language search |
| Sudden queue spikes mid-journey | En-route surge notification |
| Privacy concerns | 100% anonymous — no account needed |

---

## Roadmap

- Firebase Firestore for persistent real-time data
- WhatsApp / SMS check-in for feature phones
- ML-based prediction using weeks of historical data
- QR codes outside offices for zero-friction check-in
- Multi-language support — Hindi, Marathi, Tamil, Telugu

---

## Built With

This project was built as a hackathon project to demonstrate how civic technology can solve real problems faced by ordinary Indian citizens — without waiting for the government to act.

**Stack:** Python · FastAPI · React · TypeScript · Groq AI · Firebase · Vercel · Railway

---

## Author

[github.com/Ardent-7322](https://github.com/Ardent-7322)
