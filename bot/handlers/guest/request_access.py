from urllib.parse import urljoin
from aiogram import F, Router
from aiogram.types import CallbackQuery
import httpx

from config import BACKEND_URL
from lexicon.ru import LEXICON_RU

router: Router = Router(name="request_access_router")


@router.callback_query(F.data == "request_access")
async def process_request_access(callback: CallbackQuery) -> None:
    user = callback.from_user

    payload = {
        "user_id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }

    # Безопасно склеиваем базовый хост из .env и эндпоинт
    target_url = urljoin(BACKEND_URL, "/api/access/request")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(target_url, json=payload, timeout=5.0)
            result = response.json()

        if result.get("status") == "exists":
            await callback.answer(
                text=LEXICON_RU["access_already_requested"],
                show_alert=True,
            )
            return

        await callback.answer()
        await callback.message.answer(LEXICON_RU["request_access_response"])

    except Exception:
        await callback.answer(
            text="⚠️ Не удалось связаться с сервером. Попробуйте позже.",
            show_alert=True,
        )