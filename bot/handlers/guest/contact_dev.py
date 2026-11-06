from aiogram import F, Router, Bot
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message

from keyboards.inline import get_contact_cancel_keyboard
from lexicon.ru import LEXICON_RU
from config import ADMIN_ID

router: Router = Router(name="contact_dev_router")


class FSMContactDev(StatesGroup):
    waiting_for_message = State()


@router.callback_query(F.data == "contact_dev", FSMContactDev.waiting_for_message)
async def process_contact_dev_already_waiting(callback: CallbackQuery) -> None:
    await callback.answer(
        text=LEXICON_RU["contact_dev_already_waiting"],
        show_alert=True,
    )


@router.callback_query(F.data == "contact_dev")
async def process_contact_dev(callback: CallbackQuery, state: FSMContext) -> None:
    # Гасим часики загрузки на кнопке
    await callback.answer()

    # Переводим в состояние ожидания ввода
    await state.set_state(FSMContactDev.waiting_for_message)

    # Отправляем сообщение с текстом и нашей инлайн-кнопкой-пустышкой
    prompt_message = await callback.message.answer(
        text=LEXICON_RU["contact_dev_prompt"],
        reply_markup=get_contact_cancel_keyboard(),
    )
    
    # Сохраняем ID сообщения-приглашения в стейт для последующего удаления
    await state.update_data(prompt_message_id=prompt_message.message_id)


@router.callback_query(F.data == "cancel_contact", FSMContactDev.waiting_for_message)
async def process_cancel_contact(callback: CallbackQuery, state: FSMContext) -> None:
    # 1. Гасим часики на кнопке отмены
    await callback.answer()

    # 2. Достаем ID сообщения-приглашения из стейта перед его очисткой
    data = await state.get_data()
    prompt_message_id = data.get("prompt_message_id")

    # 3. Сбрасываем состояние FSM
    await state.clear()

    # 4. Удаляем сообщение-приглашение с кнопкой отмены
    if prompt_message_id:
        try:
            await callback.message.bot.delete_message(
                chat_id=callback.message.chat.id, 
                message_id=prompt_message_id
            )
        except Exception:
            pass


@router.message(FSMContactDev.waiting_for_message)
async def process_user_feedback_message(message: Message, state: FSMContext, bot: Bot) -> None:
    data = await state.get_data()
    prompt_message_id = data.get("prompt_message_id")

    # 1. Сбрасываем состояние
    await state.clear()

    # 2. Формируем карточку с данными
    user = message.from_user
    info_text = (
        "📥 <b>Новое сообщение в предложку!</b>\n"
        f"👤 <b>Имя:</b> {user.full_name}\n"
        f"🔗 <b>Юзернейм:</b> @{user.username or 'отсутствует'}\n"
        f"🆔 <b>ID:</b> <code>{user.id}</code>"
    )

    # 3. СНАЧАЛА доставляем тебе (в текущий чат для теста) саму форму/данные
    await bot.send_message(chat_id=ADMIN_ID, text=info_text)
    # Сразу за ней шлем/копируем контент пользователя
    await message.copy_to(chat_id=ADMIN_ID)

    # 4. Удаляем оба сообщения (приглашение и ввод юзера)
    if prompt_message_id:
        try:
            await bot.delete_message(chat_id=message.chat.id, message_id=prompt_message_id)
        except Exception:
            pass

    try:
        await message.delete()
    except Exception:
        pass

    # 5. И ТОЛЬКО ПОТОМ отправляем пользователю финальное подтверждение
    await message.answer(LEXICON_RU["contact_dev_success"])