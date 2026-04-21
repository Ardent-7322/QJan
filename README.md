# QJan

QJan is a queue prediction app with:

- **Backend:** FastAPI (Python)
- **Frontend:** React + TypeScript

## Project structure

- `backend/` → API server
- `frontend/` → web app

---

## Backend run (Python)

> ⚠️ Backend folder mein `npm start` nahi chalega, kyunki backend Node app nahi hai.

### 1) Create & activate virtual environment

```bash
cd backend
python -m venv .venv
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate
```

### 2) Install dependencies

```bash
pip install -r requirements.txt
```

### 3) Configure environment variables

Create `.env` in `backend/`:

```env
GEMINI_API_KEY=your_key_here
```

### 4) Start backend

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend health URL:

- `http://localhost:8000/`

Queue API examples:

- `http://localhost:8000/api/queue/`
- `http://localhost:8000/api/queue/rto_jobner`

---

## Frontend run (TypeScript)

```bash
cd frontend
npm install
npm start
```

If needed, set API URL:

```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:8000/api/queue
```

---

## Quick checks

Backend syntax check:

```bash
python -m compileall backend
```

Frontend typecheck:

```bash
cd frontend && npm run typecheck
```
