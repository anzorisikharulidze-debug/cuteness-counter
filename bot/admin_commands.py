import os
from urllib.parse import urljoin
import httpx
from aiogram import Router, types, F
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from dotenv import load_dotenv

import config
from lexicon.ru import LEXICON_RU

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

        # 3. Отправляем красивое интригующее уведомление пользователю
        if config.USER_ID:
            notification_text = LEXICON_RU["points_added_notification"].format(
                points=points,
                reason=reason
            )
            await message.bot.send_message(
                chat_id=config.USER_ID,
                text=notification_text,
                parse_mode="HTML"
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


# =====================================================================
# НОВЫЙ ФУНКЦИОНАЛ: УПРАВЛЕНИЕ ЗАДАНИЯМИ ЧЕРЕЗ БОТА
# =====================================================================


# FSM для создания заданий
class TaskCreationStates(StatesGroup):
    waiting_for_title = State()
    waiting_for_reward = State()


# Вспомогательные API-функции для работы с задачами на бэкенде
async def api_get_tasks(is_adult: bool = False) -> list:
    endpoint = "/api/adult-tasks" if is_adult else "/api/tasks"
    async with httpx.AsyncClient() as client:
        response = await client.get(urljoin(BACKEND_URL, endpoint), timeout=10.0)
        response.raise_for_status()
        return response.json()

async def api_create_task(title: str, reward: int, is_adult: bool = False) -> dict:
    endpoint = "/api/adult-tasks" if is_adult else "/api/tasks"
    async with httpx.AsyncClient() as client:
        response = await client.post(
            urljoin(BACKEND_URL, endpoint),
            json={"title": title, "reward": reward},
            timeout=10.0
        )
        response.raise_for_status()
        return response.json()

async def api_toggle_task(task_id: int, is_adult: bool = False) -> dict:
    endpoint = f"/api/adult-tasks/{task_id}/toggle" if is_adult else f"/api/tasks/{task_id}/toggle"
    async with httpx.AsyncClient() as client:
        response = await client.patch(urljoin(BACKEND_URL, endpoint), timeout=10.0)
        response.raise_for_status()
        return response.json()

async def api_reset_tasks_table(is_adult: bool = False) -> dict:
    endpoint = "/api/adult-tasks/reset" if is_adult else "/api/tasks/reset"
    async with httpx.AsyncClient() as client:
        response = await client.post(urljoin(BACKEND_URL, endpoint), timeout=10.0)
        response.raise_for_status()
        return response.json()


# --- ДОБАВЛЕНИЕ ЗАДАЧ (ДИАЛОГ FSM) ---

@router.message(Command("add_task", "add_adult_task"))
async def cmd_start_add_task(message: types.Message, state: FSMContext):
    """Старт создания задания (обычного или adult по названию команды)"""
    is_adult = "adult" in message.text
    await state.update_data(is_adult=is_adult)
    await state.set_state(TaskCreationStates.waiting_for_title)
    
    task_type_str = "🔞 Adult-задание" "📝 Обычное задание"
    await message.answer(f"Создание нового квеста ({task_type_str}).\n\nВведите **название** задания:", parse_mode="Markdown")

@router.message(TaskCreationStates.waiting_for_title)
async def process_task_title(message: types.Message, state: FSMContext):
    await state.update_data(title=message.text.strip())
    await state.set_state(TaskCreationStates.waiting_for_reward)
    await message.answer("Отлично! Теперь введите **награду** (целое число очков):", parse_mode="Markdown")

@router.message(TaskCreationStates.waiting_for_reward)
async def process_task_reward(message: types.Message, state: FSMContext):
    try:
        reward = int(message.text.strip())
    except ValueError:
        await message.answer("❌ Награда должна быть числом. Введите число еще раз:")
        return

    data = await state.get_data()
    title = data.get("title")
    is_adult = data.get("is_adult", False)

    try:
        await api_create_task(title=title, reward=reward, is_adult=is_adult)
        await state.clear()
        task_type_str = "Adult" "Обычное"
        await message.answer(f"✅ {task_type_str} задание *«{title}»* с наградой `+{reward}` успешно создано!", parse_mode="Markdown")
    except Exception as e:
        await state.clear()
        await message.answer(f"❌ Ошибка при создании задания на бэкенде: {e}")


# --- ПРОСМОТР И ПЕРЕКЛЮЧЕНИЕ СТАТУСА ЗАДАНИЙ ---

async def send_tasks_list(message: types.Message, is_adult: bool):
    try:
        tasks = await api_get_tasks(is_adult=is_adult)
        title_prefix = "🔞 Список Adult-заданий:" "📋 Список обычных заданий:"
        
        if not tasks:
            await message.answer(f"{title_prefix}\n\n*Пусто*. Создайте первое командой /add_adult_task или /add_task.", parse_mode="Markdown")
            return

        keyboard_buttons = []
        for t in tasks:
            status_icon = "✅" if t.get("completed") else "❌"
            # Текст на кнопке показывает текущий статус, клик инвертирует его
            btn_text = f"{status_icon} {t['title']} ({t['reward']} pts)"
            callback_data = f"toggle_task_{'adult_' if is_adult else 'reg_'}{t['id']}"
            keyboard_buttons.append([types.InlineKeyboardButton(text=btn_text, callback_data=callback_data)])

        keyboard = types.InlineKeyboardMarkup(inline_keyboard=keyboard_buttons)
        await message.answer(f"{title_prefix}\nНажмите на задание, чтобы переключить его статус (выполнено / не выполнено):", reply_markup=keyboard, parse_mode="Markdown")
    except Exception as e:
        await message.answer(f"❌ Не удалось получить список заданий: {e}")

@router.message(Command("tasks"))
async def cmd_list_tasks(message: types.Message):
    await send_tasks_list(message, is_adult=False)

@router.message(Command("adult_tasks"))
async def cmd_list_adult_tasks(message: types.Message):
    await send_tasks_list(message, is_adult=True)


@router.callback_query(F.data.startswith("toggle_task_"))
async def process_toggle_task(callback: types.CallbackQuery):
    data = callback.data.replace("toggle_task_", "")
    is_adult = data.startswith("adult_")
    task_id = int(data.replace("adult_", "").replace("reg_", ""))

    try:
        updated_task = await api_toggle_task(task_id, is_adult=is_adult)
        status_text = "Выполнено ✅" if updated_task.get("completed") else "Не выполнено ❌"
        
        await callback.answer(f"Статус изменен: {status_text}")
        
        # Обновляем инлайн-клавиатуру в сообщении
        await send_updated_tasks_markup(callback.message, is_adult)
    except Exception as e:
        await callback.answer(f"Ошибка: {e}", show_alert=True)

async def send_updated_tasks_markup(message: types.Message, is_adult: bool):
    try:
        tasks = await api_get_tasks(is_adult=is_adult)
        keyboard_buttons = []
        for t in tasks:
            status_icon = "✅" if t.get("completed") else "❌"
            btn_text = f"{status_icon} {t['title']} ({t['reward']} pts)"
            callback_data = f"toggle_task_{'adult_' if is_adult else 'reg_'}{t['id']}"
            keyboard_buttons.append([types.InlineKeyboardButton(text=btn_text, callback_data=callback_data)])
        
        keyboard = types.InlineKeyboardMarkup(inline_keyboard=keyboard_buttons)
        await message.edit_reply_markup(reply_markup=keyboard)
    except Exception:
        pass  # Если сообщение не изменилось, игнорируем


# --- СБРОС ТАБЛИЦ ЗАДАНИЙ ---

@router.message(Command("reset_tasks"))
async def cmd_reset_tasks(message: types.Message):
    try:
        await api_reset_tasks_table(is_adult=False)
        await message.answer("🧹 Таблица обычных заданий полностью очищена и сброшена.")
    except Exception as e:
        await message.answer(f"❌ Ошибка сброса: {e}")

@router.message(Command("reset_adult_tasks"))
async def cmd_reset_adult_tasks(message: types.Message):
    try:
        await api_reset_tasks_table(is_adult=True)
        await message.answer("🧹 Таблица adult-заданий полностью очищена и сброшена.")
    except Exception as e:
        await message.answer(f"❌ Ошибка сброса: {e}")