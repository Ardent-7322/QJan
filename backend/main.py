from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import queue, ai
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("QJan API ready — Running in Mock mode")
    yield
    # Shutdown
    print("QJan shutting down...")

app = FastAPI(title="QJan API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(queue.router, prefix="/api/queue")
app.include_router(ai.router, prefix="/api/ai")

@app.get("/")
def root():
    return {
        "app": "QJan",
        "tagline": "Jaane se pehle Jaane",
        "status": "Live and running in Mock mode 🚀"
    }