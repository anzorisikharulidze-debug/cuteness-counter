import os
import asyncio
import logging
import sys
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
import requests
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
WEB_APP_URL = os.getenv("WEB_APP_URL", "http://localhost:5173")

bot = Bot(token=TOKEN)
dp = Dispatcher()


@dp.message(Command("start"))
async def cmd_start(message: types.Message):
  """Команда /start: приветствие и кнопка для открытия Mini App"""
  keyboard = InlineKeyboardMarkup(inline_keyboard=[[
      inline_button := InlineKeyboardButton(
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
async def cmd_add(message: types.Message):
  """Команда для начисления очков: /add 25 За улыбку"""
  args = message.text.split(maxsplit=2)

  if len(args) < 2:
    await message.answer(
        "Использование: `/add <очки> [причина]`\nПример: `/add 25 За самую"
        " милую улыбку`",
        parse_mode="Markdown",
    )
    return

  try:
    points = int(args[1])
    reason = args[2] if len(args) > 2 else "Начисление через бота"
  except ValueError:
    await message.answer("Ошибка: количество очков должно быть числом!")
    return

  # Отправляем запрос на наш FastAPI бэкенд
  try:
    response = requests.post(
        f"{BACKEND_URL}/api/add", json={"points": points, "reason": reason}
    )
    if response.status_code == 200:
      data = response.json()
      await message.answer(
          f"✅ Успешно начислено: `+{points}` очков!\n💬 Причина:"
          f" *{reason}*\n📊 Новый баланс: *{data['new_balance']}*",
          parse_mode="Markdown",
      )
    else:
      await message.answer("❌ Ошибка сервера при обновлении баланса.")
  except requests.exceptions.ConnectionError:
    await message.answer(
        "❌ Не удалось подключиться к FastAPI серверу. Убедись, что бэкенд"
        " запущен!"
    )


async def main():
  logging.basicConfig(
      level=logging.INFO, stream=sys.stdout
  )  # Используем стандартный вывод для логов
  print("🤖 Бот запущен и ждет команд...")
  await dp.start_polling(bot)


if __name__ == "__main__":
  asyncio.run(main())