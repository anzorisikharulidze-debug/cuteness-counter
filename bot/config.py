import os
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

if not TOKEN:
    raise ValueError("Не задан TELEGRAM_BOT_TOKEN в переменных окружения.")

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")

ADMIN_ID = int(os.getenv("ADMIN_ID", 0))
USER_ID = int(os.getenv("USER_ID", 0))