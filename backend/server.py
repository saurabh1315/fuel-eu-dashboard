from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# In-memory data storage
routes_data = [
    {"id": "1", "name": "Route A", "origin": "NYC", "destination": "LAX", "distance": 2451, "status": "active", "baseline": None},
    {"id": "2", "name": "Route B", "origin": "CHI", "destination": "MIA", "distance": 1378, "status": "active", "baseline": None},
    {"id": "3", "name": "Route C", "origin": "SEA", "destination": "DEN", "distance": 1321, "status": "pending", "baseline": None},
    {"id": "4", "name": "Route D", "origin": "BOS", "destination": "SFO", "distance": 2704, "status": "active", "baseline": None},
    {"id": "5", "name": "Route E", "origin": "ATL", "destination": "DFW", "distance": 721, "status": "inactive", "baseline": None},
]

comparison_data = [
    {"id": "1", "route_name": "Route A", "current_cost": 12500, "baseline_cost": 11800, "difference_pct": 5.93, "compliant": False},
    {"id": "2", "route_name": "Route B", "current_cost": 8200, "baseline_cost": 8500, "difference_pct": -3.53, "compliant": True},
    {"id": "3", "route_name": "Route C", "current_cost": 7800, "baseline_cost": 7600, "difference_pct": 2.63, "compliant": True},
    {"id": "4", "route_name": "Route D", "current_cost": 15200, "baseline_cost": 14000, "difference_pct": 8.57, "compliant": False},
    {"id": "5", "route_name": "Route E", "current_cost": 4500, "baseline_cost": 4600, "difference_pct": -2.17, "compliant": True},
]

compliance_cb_data = {
    "total_routes": 5,
    "compliant_count": 3,
    "non_compliant_count": 2,
    "compliance_rate": 60.0,
    "last_updated": datetime.now(timezone.utc).isoformat(),
}

banking_data = {
    "cb_balance": 125000.00,
    "pending_transactions": 3,
    "last_bank_date": "2026-01-10",
    "last_apply_date": "2026-01-08",
}

pools_data = [
    {"id": "1", "name": "Northeast Pool", "routes_count": 12, "total_volume": 45000, "created_at": "2025-12-01"},
    {"id": "2", "name": "West Coast Pool", "routes_count": 8, "total_volume": 32000, "created_at": "2025-12-15"},
    {"id": "3", "name": "Midwest Hub", "routes_count": 15, "total_volume": 58000, "created_at": "2026-01-02"},
]

# Pydantic models
class RouteModel(BaseModel):
    id: str
    name: str
    origin: str
    destination: str
    distance: int
    status: str
    baseline: Optional[str]

class BaselineResponse(BaseModel):
    id: str
    name: str
    baseline: str
    message: str

class ComparisonModel(BaseModel):
    id: str
    route_name: str
    current_cost: float
    baseline_cost: float
    difference_pct: float
    compliant: bool

class ComplianceCBModel(BaseModel):
    total_routes: int
    compliant_count: int
    non_compliant_count: int
    compliance_rate: float
    last_updated: str

class BankingModel(BaseModel):
    cb_balance: float
    pending_transactions: int
    last_bank_date: str
    last_apply_date: str

class BankRequest(BaseModel):
    amount: float

class ApplyRequest(BaseModel):
    route_id: str
    amount: float

class BankResponse(BaseModel):
    success: bool
    new_balance: float
    message: str

class ApplyResponse(BaseModel):
    success: bool
    route_id: str
    amount_applied: float
    message: str

class PoolModel(BaseModel):
    id: str
    name: str
    routes_count: int
    total_volume: int
    created_at: str

class PoolCreateRequest(BaseModel):
    name: str
    routes_count: int = 0
    total_volume: int = 0

class PoolCreateResponse(BaseModel):
    success: bool
    pool: PoolModel
    message: str

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Dashboard API"}

@api_router.get("/routes", response_model=List[RouteModel])
async def get_routes():
    return routes_data

@api_router.post("/routes/{route_id}/baseline", response_model=BaselineResponse)
async def set_baseline(route_id: str):
    for route in routes_data:
        if route["id"] == route_id:
            baseline_time = datetime.now(timezone.utc).isoformat()
            route["baseline"] = baseline_time
            return BaselineResponse(
                id=route["id"],
                name=route["name"],
                baseline=baseline_time,
                message=f"Baseline set for {route['name']}"
            )
    raise HTTPException(status_code=404, detail="Route not found")

@api_router.get("/routes/comparison", response_model=List[ComparisonModel])
async def get_comparison():
    return comparison_data

@api_router.get("/compliance/cb", response_model=ComplianceCBModel)
async def get_compliance_cb():
    return compliance_cb_data

@api_router.post("/banking/bank", response_model=BankResponse)
async def bank_funds(request: BankRequest):
    global banking_data
    banking_data["cb_balance"] += request.amount
    banking_data["last_bank_date"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return BankResponse(
        success=True,
        new_balance=banking_data["cb_balance"],
        message=f"Successfully banked ${request.amount:,.2f}"
    )

@api_router.post("/banking/apply", response_model=ApplyResponse)
async def apply_funds(request: ApplyRequest):
    global banking_data
    if request.amount > banking_data["cb_balance"]:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    banking_data["cb_balance"] -= request.amount
    banking_data["last_apply_date"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return ApplyResponse(
        success=True,
        route_id=request.route_id,
        amount_applied=request.amount,
        message=f"Applied ${request.amount:,.2f} to route {request.route_id}"
    )

@api_router.get("/banking", response_model=BankingModel)
async def get_banking():
    return banking_data

@api_router.post("/pools", response_model=PoolCreateResponse)
async def create_pool(request: PoolCreateRequest):
    new_id = str(len(pools_data) + 1)
    new_pool = PoolModel(
        id=new_id,
        name=request.name,
        routes_count=request.routes_count,
        total_volume=request.total_volume,
        created_at=datetime.now(timezone.utc).strftime("%Y-%m-%d")
    )
    pools_data.append(new_pool.model_dump())
    return PoolCreateResponse(
        success=True,
        pool=new_pool,
        message=f"Pool '{request.name}' created successfully"
    )

@api_router.get("/pools", response_model=List[PoolModel])
async def get_pools():
    return pools_data

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
