from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class Bill(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    amount: float
    due_date: str
    paid: bool = False
    category: str
    recurring: bool = False
    recurrence_frequency: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BillCreate(BaseModel):
    name: str
    amount: float
    due_date: str
    category: str
    recurring: bool = False
    recurrence_frequency: Optional[str] = None

class BillUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    due_date: Optional[str] = None
    paid: Optional[bool] = None
    category: Optional[str] = None
    recurring: Optional[bool] = None
    recurrence_frequency: Optional[str] = None

class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    amount: float
    renewal_date: str
    status: str = "active"
    category: str
    billing_cycle: str
    usage_frequency: Optional[str] = "regular"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SubscriptionCreate(BaseModel):
    name: str
    amount: float
    renewal_date: str
    category: str
    billing_cycle: str
    usage_frequency: Optional[str] = "regular"

class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    renewal_date: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    billing_cycle: Optional[str] = None
    usage_frequency: Optional[str] = None

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    due_date: str
    completed: bool = False
    priority: str = "medium"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: str
    priority: str = "medium"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None

class DashboardSummary(BaseModel):
    total_bills: int
    unpaid_bills: int
    upcoming_bills: int
    total_subscriptions: int
    monthly_subscription_cost: float
    total_tasks: int
    pending_tasks: int
    upcoming_deadlines: int

class AIInsight(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    insight_type: str
    content: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Bills endpoints
@api_router.post("/bills", response_model=Bill)
async def create_bill(input: BillCreate):
    bill_dict = input.model_dump()
    bill_obj = Bill(**bill_dict)
    doc = bill_obj.model_dump()
    await db.bills.insert_one(doc)
    return bill_obj

@api_router.get("/bills", response_model=List[Bill])
async def get_bills():
    bills = await db.bills.find({}, {"_id": 0}).to_list(1000)
    return bills

@api_router.put("/bills/{bill_id}", response_model=Bill)
async def update_bill(bill_id: str, input: BillUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None or k in ('paid', 'completed', 'status')}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.bills.find_one_and_update(
        {"id": bill_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Bill not found")
    result.pop("_id", None)
    return Bill(**result)

@api_router.delete("/bills/{bill_id}")
async def delete_bill(bill_id: str):
    result = await db.bills.delete_one({"id": bill_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bill not found")
    return {"message": "Bill deleted"}

# Subscriptions endpoints
@api_router.post("/subscriptions", response_model=Subscription)
async def create_subscription(input: SubscriptionCreate):
    sub_dict = input.model_dump()
    sub_obj = Subscription(**sub_dict)
    doc = sub_obj.model_dump()
    await db.subscriptions.insert_one(doc)
    return sub_obj

@api_router.get("/subscriptions", response_model=List[Subscription])
async def get_subscriptions():
    subs = await db.subscriptions.find({}, {"_id": 0}).to_list(1000)
    return subs

@api_router.put("/subscriptions/{sub_id}", response_model=Subscription)
async def update_subscription(sub_id: str, input: SubscriptionUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None or k in ('paid', 'completed', 'status')}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.subscriptions.find_one_and_update(
        {"id": sub_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Subscription not found")
    result.pop("_id", None)
    return Subscription(**result)

@api_router.delete("/subscriptions/{sub_id}")
async def delete_subscription(sub_id: str):
    result = await db.subscriptions.delete_one({"id": sub_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"message": "Subscription deleted"}

# Tasks endpoints
@api_router.post("/tasks", response_model=Task)
async def create_task(input: TaskCreate):
    task_dict = input.model_dump()
    task_obj = Task(**task_dict)
    doc = task_obj.model_dump()
    await db.tasks.insert_one(doc)
    return task_obj

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks():
    tasks = await db.tasks.find({}, {"_id": 0}).to_list(1000)
    return tasks

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, input: TaskUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None or k in ('paid', 'completed', 'status')}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.tasks.find_one_and_update(
        {"id": task_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    result.pop("_id", None)
    return Task(**result)

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}

# Dashboard summary
@api_router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary():
    bills = await db.bills.find({}, {"_id": 0}).to_list(1000)
    subscriptions = await db.subscriptions.find({}, {"_id": 0}).to_list(1000)
    tasks = await db.tasks.find({}, {"_id": 0}).to_list(1000)
    
    now = datetime.now(timezone.utc)
    upcoming_threshold = now + timedelta(days=7)
    
    unpaid_bills = sum(1 for b in bills if not b.get('paid', False))
    upcoming_bills = 0
    for b in bills:
        if not b.get('paid', False):
            due_date = datetime.fromisoformat(b['due_date'].replace('Z', '+00:00'))
            if due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)
            if due_date <= upcoming_threshold:
                upcoming_bills += 1
    
    monthly_cost = sum(s['amount'] for s in subscriptions if s.get('status') == 'active')
    
    pending_tasks = sum(1 for t in tasks if not t.get('completed', False))
    upcoming_deadlines = 0
    for t in tasks:
        if not t.get('completed', False):
            due_date = datetime.fromisoformat(t['due_date'].replace('Z', '+00:00'))
            if due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)
            if due_date <= upcoming_threshold:
                upcoming_deadlines += 1
    

    return DashboardSummary(
        total_bills=len(bills),
        unpaid_bills=unpaid_bills,
        upcoming_bills=upcoming_bills,
        total_subscriptions=len(subscriptions),
        monthly_subscription_cost=monthly_cost,
        total_tasks=len(tasks),
        pending_tasks=pending_tasks,
        upcoming_deadlines=upcoming_deadlines
    )

# AI Insights
@api_router.post("/insights/analyze")
async def analyze_insights():
    try:
        subscriptions = await db.subscriptions.find({}, {"_id": 0}).to_list(1000)
        bills = await db.bills.find({}, {"_id": 0}).to_list(1000)

        if not subscriptions and not bills:
            return {"insights": [{"type": "info", "message": "Add bills and subscriptions to get insights"}]}

        insights = []

        rarely_used = [s for s in subscriptions if s.get("usage_frequency") == "rarely"]
        for s in rarely_used:
            insights.append({"type": "warning", "message": f"{s['name']} is marked as rarely used — consider canceling it to save ₹{s['amount']:.2f}/month."})

        unpaid = [b for b in bills if not b.get("paid", False)]
        if unpaid:
            total = sum(b["amount"] for b in unpaid)
            insights.append({"type": "warning", "message": f"You have {len(unpaid)} unpaid bill(s) totaling ₹{total:.2f}. Review them to avoid late fees."})

        streaming = [s for s in subscriptions if s.get("category") == "streaming"]
        if len(streaming) > 1:
            insights.append({"type": "info", "message": f"You have {len(streaming)} streaming services. Consider rotating them monthly to cut costs."})

        total_subs = sum(s["amount"] for s in subscriptions if s.get("status") == "active")
        insights.append({"type": "success", "message": f"Your total monthly subscription spend is ₹{total_subs:.2f}. Keep reviewing usage regularly."})

        return {"insights": insights}

    except Exception as e:
        logging.error(f"Analysis error: {str(e)}")
        return {"insights": [{"type": "error", "message": f"Analysis failed: {str(e)}"}]}

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()