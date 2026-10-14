from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from server.database import init_db, get_current_state, add_points

app = FastAPI()

# Включаем CORS, чтобы Mini App мог свободно стучаться к бэкенду
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализируем базу данных при старте
init_db()

class PointsRequest(BaseModel):
    points: int
    reason: str

@app.get("/api/state")
def get_state():
    return get_current_state()

@app.post("/api/add")
def reward_points(data: PointsRequest):
    new_balance = add_points(data.points, data.reason)
    return {"status": "success", "new_balance": new_balance}