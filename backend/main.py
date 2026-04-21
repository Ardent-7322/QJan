from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import queue, ai

app = FastAPI(title = "QJan API")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_methods = ["*"],      
    allow_headers = ["*"],
)

app.include_router(queue.router, prefix = "/api/queue")
app.include_router(ai.router, prefix="/api/ai")

@app.get("/")
def root():
    return {
        "app" : "QJan",
        "tagline" : "Jaane se pehle jaanein",
        "status" : "Live"
        
        }