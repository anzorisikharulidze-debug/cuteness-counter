import os
import psycopg2
from aiogram import Router, types
from aiogram.filters import Command
from dotenv import load_dotenv

load_dotenv()

router = Router(name="admin_commands_router")
DATABASE_URL = os.getenv("DATABASE_URL")


# --- ПРЯМАЯ РАБОТА С БАЗОЙ ДАННЫХ ДЛЯ КОМАНД ---

def db_add_points(points: int, reason: str) -> int:
    """Добавляет очки в таблицу и возвращает новый баланс"""
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("UPDATE user_balance SET balance = balance + %s WHERE id = 1", (points,))
    cursor.execute("INSERT INTO transactions (points, reason) VALUES (%s, %s)", (points, reason))
    conn.commit()
    
    cursor.execute("SELECT balance FROM user_balance WHERE id = 1")
    new_balance = cursor.fetchone()[0]
    
    cursor.close()
    conn.close()
    return new_balance


def db_reset_database():
    """Полный сброс таблиц и обнуление баланса"""
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("TRUNCATE TABLE user_balance, transactions RESTART IDENTITY CASCADE;")
    cursor.execute("INSERT INTO user_balance (balance) VALUES (0)")
    
    conn.commit()
    cursor.close()
    conn.close()


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
        new_balance = db_add_points(points, reason)
        await message.answer(
            f"✅ Успешно начислено: `+{points}` очков!\n💬 Причина: *{reason}*\n📊 Новый баланс: *{new_balance}*",
            parse_mode="Markdown",
        )
    except Exception as e:
        await message.answer(f"❌ Ошибка при работе с базой данных: {e}")


@router.message(Command("reset"))
async def cmd_reset(message: types.Message):
    """Команда для полного сброса всех очков милоты"""
    try:
        db_reset_database()
        await message.answer(
            "💥 *Внимание!* Произведен полный сброс системы.\n📊 Баланс очков милоты обнулен: *0*",
            parse_mode="Markdown",
        )
    except Exception as e:
        await message.answer(f"❌ Ошибка при сбросе базы данных: {e}")