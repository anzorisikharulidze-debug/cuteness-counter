import os
from urllib.parse import urljoin
import httpx
from aiogram import Router, types
from aiogram.filters import Command
from dotenv import load_dotenv

load_dotenv()

router = Router(name="admin_commands_router")
BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")


# --- ВЗАИМОДЕЙСТВИЕ С БЭКЕНДОМ ЧЕРЕЗ API ---

async def api_add_points(points: int, reason: str) -> dict:
    """Отправляет POST-запрос на бэкенд для начисления очков"""
    target_url = urljoin(BACKEND_URL, "/api/add")
    async with httpx.AsyncClient() as client:
        response = await client.post(
            target_url, 
            json={"points": points, "reason": reason}, 
            timeout=10.0
        )
        response.raise_for_status()
        return response.json()


async def api_reset_database() -> dict:
    """Отправляет POST-запрос на бэкенд для полного сброса базы"""
    target_url = urljoin(BACKEND_URL, "/api/reset")
    async with httpx.AsyncClient() as client:
        response = await client.post(target_url, timeout=10.0)
        response.raise_for_status()
        return response.json()


# --- АДМИНСКИЕ КОМАНДЫ БОТА ---

@router.message(Command("add"))
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

    try:
        result = await api_add_points(points, reason)
        new_balance = result.get("new_balance", "неизвестно")
        await message.answer(
            f"✅ Успешно начислено: `+{points}` очков!\n💬 Причина: *{reason}*\n📊 Новый баланс: *{new_balance}*",
            parse_mode="Markdown",
        )
    except httpx.HTTPStatusError as e:
        await message.answer(f"❌ Ошибка бэкенда: статус {e.response.status_code}")
    except httpx.RequestError:
        await message.answer("❌ Не удалось связаться с бэкендом. Убедитесь, что сервер запущен.")


@router.message(Command("reset"))
async def cmd_reset(message: types.Message):
    """Команда для полного сброса всех очков милоты"""
    try:
        await api_reset_database()
        await message.answer(
            "💥 *Внимание!* Произведен полный сброс системы.\n📊 Баланс очков милоты обнулен: *0*",
            parse_mode="Markdown",
        )
    except httpx.HTTPStatusError as e:
        await message.answer(f"❌ Ошибка сервера при сбросе: статус {e.response.status_code}")
    except httpx.RequestError:
        await message.answer("❌ Не удалось связаться с бэкендом. Попробуйте позже.")