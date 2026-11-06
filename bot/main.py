import os
import asyncio
import logging
import sys
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse
import uvicorn

import config
from handlers import start
from handlers.guest import request_access
from handlers.guest.contact_dev import router as contact_dev_router
from admin_commands import router as admin_commands_router

bot = Bot(token=config.TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()

# Подключаем роутер с хэндлерами
dp.include_router(start.router)
dp.include_router(request_access.router)
dp.include_router(contact_dev_router)

dp.include_router(admin_commands_router)

app = FastAPI()


@app.get("/")
def health_check():
    return {"status": "ok"}


@app.get("/healthz", response_class=PlainTextResponse)
def healthz_check():
    return "OK"


async def start_telegram_bot():
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    print("бот запущен...")
    await dp.start_polling(bot)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(start_telegram_bot())


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)