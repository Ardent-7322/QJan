# QJan

QJan helps you check how long the queue is at government offices before you leave home. No more wasting hours standing in line without knowing when your turn will come.

## Problem

People visit offices like RTO, Passport Seva, hospitals, and post offices without any idea how crowded it is. Sometimes you wait 3 hours for work that takes 5 minutes. There is no system, no display board, no way to know. QJan fixes this.

## Features

Live queue count that updates every 10 seconds so you always see the current situation.

Wait time prediction that tells you roughly how long you will wait based on how many people are ahead.

Best time suggester that looks at historical data and tells you the quietest slot to visit today.

AI search where you just type what you need in plain words like "renew driving license" and it finds the right office for you.

AI anomaly detector that notices when a queue is unusually crowded and tells you why and what to do.

AI visit planner where you tell it when you are free and it picks the best slot based on past patterns.

Anonymous check-in so users can add themselves to the queue count without any account or login.

Office watch with notifications that alerts you when the queue drops below your threshold or suddenly surges while you are on the way.

## Tech Stack

Frontend is React with TypeScript. Backend is Python with FastAPI. AI runs on Groq using Llama 3.1. Database is Firebase Firestore. Notifications use the browser Notification API with localStorage for storing watchlist preferences.

## How It Predicts

The wait time formula is simple. Take the number of people currently in queue, multiply by the average time each person takes, and add a 10 percent buffer for real world delays like slow counters or chai breaks.

The best time suggestion works by looking at which hour historically has the lowest queue count for that day of the week. No machine learning needed. Just clean pattern matching on real data.

## Pros

Works without any government involvement or permission. Fully anonymous so no privacy concerns. Gets smarter as more people use it because check-in data improves the averages. AI features make it usable for anyone even if they do not know which office handles what. Surge alerts solve the problem of queues changing while you are already travelling.

## Cons

Accuracy depends on how many people are actively checking in. In early stages with low users the predictions may be off. Data resets if the server restarts since Firebase is not yet fully integrated. Browser notifications only work if the user grants permission and keeps the tab open. Currently works best on mobile but is not a native app so some features like background notifications are limited.

## Getting Started

Clone the repo then set up backend and frontend separately.

For backend create a virtual environment, install dependencies from requirements.txt, add your Groq API key to a .env file, and run uvicorn main:app --reload.

For frontend run npm install then npm start. Set REACT_APP_API_URL in a .env file pointing to your backend.

Full setup details are in the backend and frontend folders.
