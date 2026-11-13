from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from server.database import (
    init_db, 
    get_current_state, 
    add_points, 
    reset_database,
    request_user_access,
    get_transactions_history,
    get_tasks,
    add_task,
    toggle_task_status,
    reset_tasks_table,
)
from fastapi.responses import PlainTextResponse

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

class AccessRequestModel(BaseModel):
    user_id: int
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None

@app.get("/api/state")
def get_state():
    return get_current_state()

@app.get("/healthz", response_class=PlainTextResponse)
def healthz_check():
    return "OK"

@app.post("/api/add")
def reward_points(data: PointsRequest):
    new_balance = add_points(data.points, data.reason)
    return {"status": "success", "new_balance": new_balance}

@app.post("/api/reset")
def reset_counter():
    """Эндпоинт для полного сброса базы данных до нуля"""
    try:
        reset_database()
        return {"status": "success", "message": "База данных успешно сброшена", "new_balance": 0}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

@app.post("/api/access/request")
def api_request_access(data: AccessRequestModel):
    status = request_user_access(
        user_id=data.user_id,
        username=data.username,
        first_name=data.first_name,
        last_name=data.last_name
    )
    return {"status": status}

@app.get("/api/transactions")
def get_transactions():
    return get_transactions_history()

@app.get("/api/tasks")
def get_regular_tasks():
    """Эндпоинт для получения обычных заданий"""
    try:
        return get_tasks(is_adult=False)
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

@app.get("/api/adult-tasks")
def get_adult_tasks():
    """Эндпоинт для получения adult-заданий"""
    try:
        return get_tasks(is_adult=True)
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

class TaskCreateRequest(BaseModel):
    title: str
    reward: int

@app.post("/api/tasks")
def create_regular_task(data: TaskCreateRequest):
    """Создание обычного задания"""
    try:
        add_task(data.title, data.reward, is_adult=False)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

@app.post("/api/adult-tasks")
def create_adult_task(data: TaskCreateRequest):
    """Создание adult-задания"""
    try:
        add_task(data.title, data.reward, is_adult=True)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

@app.patch("/api/tasks/{task_id}/toggle")
def toggle_regular_task(task_id: int):
    """Переключение статуса обычного задания"""
    try:
        updated = toggle_task_status(task_id, is_adult=False)
        return updated
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

@app.patch("/api/adult-tasks/{task_id}/toggle")
def toggle_adult_task(task_id: int):
    """Переключение статуса adult-задания"""
    try:
        updated = toggle_task_status(task_id, is_adult=True)
        return updated
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

@app.post("/api/tasks/reset")
def reset_regular_tasks():
    """Сброс таблицы обычных заданий"""
    try:
        reset_tasks_table(is_adult=False)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

@app.post("/api/adult-tasks/reset")
def reset_adult_tasks():
    """Сброс таблицы adult-заданий"""
    try:
        reset_tasks_table(is_adult=True)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500