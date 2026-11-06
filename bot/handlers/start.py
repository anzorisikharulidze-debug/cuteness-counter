from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

from filters.role_filters import IsAdmin, IsUser
from keyboards.inline import get_guest_keyboard
from keyboards.inline import get_user_keyboard
from lexicon.ru import LEXICON_RU

router: Router = Router(name="start_router")


@router.message(Command("start"), IsAdmin())
async def cmd_start_admin(message: Message) -> None:
    await message.answer(LEXICON_RU["start_admin"])


@router.message(Command("start"), IsUser())
async def cmd_start_user(message: Message) -> None:
    await message.answer(
        text=LEXICON_RU["start_user"],
        reply_markup=get_user_keyboard(),
    )


@router.message(Command("start"))
async def cmd_start_guest(message: Message) -> None:
    await message.answer(
        text=LEXICON_RU["start_guest"],
        reply_markup=get_guest_keyboard(),
    )