from aiogram.filters import BaseFilter
from aiogram.types import Message
from config import ADMIN_ID, USER_ID

class IsAdmin(BaseFilter):
    async def __call__(self, message: Message) -> bool:
        # Пока возвращаем False, чтобы протестировать гостя
        return message.from_user.id == ADMIN_ID

class IsUser(BaseFilter):
    async def __call__(self, message: Message) -> bool:
        # Пока возвращаем False
        return message.from_user.id == USER_ID