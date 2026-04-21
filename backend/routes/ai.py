from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai import natural_search, explain_anomaly, plan_visit

router = APIRouter()

# A — Natural Language Search
class SearchRequest(BaseModel):
    query: str

@router.post("/search")
async def ai_search(req: SearchRequest):
    try:
        result = await natural_search(req.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# B — Anomaly Explainer
@router.get("/anomaly/{office_id}")
async def anomaly(office_id: str):
    try:
        result = await explain_anomaly(office_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# C — Visit Planner
class PlanRequest(BaseModel):
    office_id: str
    free_slots: list[str]

@router.post("/plan")
async def plan(req: PlanRequest):
    try:
        result = await plan_visit(req.office_id, req.free_slots)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))