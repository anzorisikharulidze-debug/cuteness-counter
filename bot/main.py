import os
import asyncio
import logging
import sys
from functools import wraps
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import Command
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    InlineQuery,
    InlineQueryResultArticle,
    InputTextMessageContent,
    WebAppInfo,
)
import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse
import uvicorn

load_dotenv()

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
WEB_APP_URL = os.getenv("WEB_APP_URL", "http://localhost:5173").rstrip("/")

bot = Bot(token=TOKEN)
dp = Dispatcher()

ALLOWED_USER_IDS = [1890526567]

app = FastAPI()

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.get("/healthz", response_class=PlainTextResponse)
def healthz_check():
    return "OK"

def admin_only(handler):
    """Декоратор проверки прав: если пользователя нет в списке, шлем заглушку"""
    @wraps(handler)
    async def wrapper(message: types.Message, *args, **kwargs):
        if message.from_user.id not in ALLOWED_USER_IDS:
            await message.answer("⛔ У вас нет полномочий для управления этим ботом.")
            return
        return await handler(message, *args, **kwargs)
    return wrapper


@dp.inline_query()
async def inline_query_handler(inline_query: InlineQuery):
  """Обрабатывает вызов бота через собачку (@botname в любом чате)."""
  
  # Формируем карточку с текстом и ссылкой на Mini App (без запрещенных web_app кнопок)
  results = [
      InlineQueryResultArticle(
          id="cuteness_app_card",
          title="✨ Открыть Cuteness Counter",
          description="Нажмите, чтобы отправить ссылку на Mini App в чат",
          input_message_content=InputTextMessageContent(
              message_text=(
                  "💖 Лови мини-приложение «Счетчик милоты»!\n\n"
                  f"👉 Открыть: {WEB_APP_URL}"
              ),
              parse_mode="Markdown",
          ),
      )
  ]

  try:
    await inline_query.answer(results, cache_time=1, is_personal=True)
  except Exception as e:
    print(f"❌ Ошибка в inline_query: {e}")


@dp.message(Command("start"))
@admin_only
async def cmd_start(message: types.Message):
    """Команда /start: приветствие и кнопка для открытия Mini App"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="✨ Открыть Cuteness Counter",
            web_app=WebAppInfo(url=WEB_APP_URL),
        )
    ]])

    await message.answer(
        "Привет! Это уютный счетчик милоты для вас с Раминой.\n\n"
        "Нажми на кнопку ниже, чтобы открыть мини-приложение:",
        reply_markup=keyboard,
    )


@dp.message(Command("add"))
@admin_only
async def cmd_add(message: types.Message):
    """Команда для начисления очков: /add 25 За улыбку"""
    args = message.text.split(maxsplit=2)

    if len(args) < 2:
        await message.answer(
            "Использование: `/add <очки> [причина]`\nПример: `/add 25 За самую милую улыбку`",
            parse_mode="Markdown",
        )
        return

    try:
        points = int(args[1])
        reason = args[2] if len(args) > 2 else "Начисление через бота"
    except ValueError:
        await message.answer("❌ Ошибка: количество очков должно быть числом!")
        return

    # Отправляем запрос на наш FastAPI бэкенд
    url = f"{BACKEND_URL}/api/add"
    print(f"🚀 Отправка POST запроса на {url} с данными: points={points}, reason={reason}")
    
    try:
        response = requests.post(
            url, json={"points": points, "reason": reason}, timeout=10
        )
        print(f"📥 Ответ от бэкенда: статус {response.status_code}, тело: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            await message.answer(
                f"✅ Успешно начислено: `+{points}` очков!\n💬 Причина: *{reason}*\n📊 Новый баланс: *{data.get('new_balance', 'неизвестно')}*",
                parse_mode="Markdown",
            )
        else:
            await message.answer(f"❌ Ошибка сервера: статус {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Ошибка соединения с бэкендом!")
        await message.answer("❌ Не удалось подключиться к FastAPI серверу. Убедись, что бэкенд запущен!")
    except requests.exceptions.Timeout:
        print("❌ Превышено время ожидания ответа от бэкенда (Render просыпается?)")
        await message.answer("⏳ Сервер на Render просыпается (Cold Start). Попробуй повторить запрос через 30 секунд!")


@dp.message(Command("reset"))
@admin_only
async def cmd_reset(message: types.Message):
    """Команда для полного сброса всех очков милоты"""
    url = f"{BACKEND_URL}/api/reset"
    print(f"🚀 Отправка POST запроса на {url}")
    
    try:
        response = requests.post(url, timeout=10)
        print(f"📥 Ответ от бэкенда: статус {response.status_code}")
        
        if response.status_code == 200:
            await message.answer(
                "💥 *Внимание!* Произведен полный сброс системы.\n📊 Баланс очков милоты обнулен: *0*",
                parse_mode="Markdown",
            )
        else:
            await message.answer(f"❌ Ошибка сервера при сбросе данных: статус {response.status_code}")
    except requests.exceptions.ConnectionError:
        await message.answer("❌ Не удалось подключиться к FastAPI серверу. Убедись, что бэкенд запущен!")
    except requests.exceptions.Timeout:
        await message.answer("⏳ Сервер на Render просыпается. Повтори запрос еще раз.")


async def start_telegram_bot():
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    print("🤖 Бот запущен и ждет команд...")
    await dp.start_polling(bot)


@app.on_event("startup")
async def startup_event():
    """При старте FastAPI сервера параллельно запускаем Telegram-бота"""
    asyncio.create_task(start_telegram_bot())

    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)