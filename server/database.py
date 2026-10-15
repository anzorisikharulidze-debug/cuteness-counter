import os
import psycopg2
from dotenv import load_dotenv

# Загружаем переменные из локального .env файла (если он есть)
load_dotenv()

# Берем строку подключения из окружения. 
# Если её нет, для подстраховки можно оставить заглушку или падать с ошибкой
DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
    """Создает и возвращает подключение к PostgreSQL (Supabase)"""
    if not DATABASE_URL:
        raise ValueError("Переменная окружения DATABASE_URL не задана!")
    return psycopg2.connect(DATABASE_URL)

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Таблица для текущего баланса очков (SERIAL вместо INTEGER PRIMARY KEY AUTOINCREMENT)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_balance (
            id SERIAL PRIMARY KEY,
            balance INTEGER NOT NULL DEFAULT 0
        )
    """)
    
    # Таблица для истории начислений
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            points INTEGER NOT NULL,
            reason TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Создаем начальную запись с 0 очками, если база пустая
    cursor.execute("SELECT COUNT(*) FROM user_balance")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO user_balance (balance) VALUES (0)")
        
    conn.commit()
    cursor.close()
    conn.close()

def get_current_state():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT balance FROM user_balance WHERE id = 1")
    row = cursor.fetchone()
    balance = row[0] if row else 0
    
    cursor.execute("SELECT points, reason, created_at FROM transactions ORDER BY created_at DESC LIMIT 10")
    history = [
        {"points": r[0], "reason": r[1], "created_at": r[2].isoformat() if r[2] else None} 
        for r in cursor.fetchall()
    ]
    
    cursor.close()
    conn.close()
    return {"balance": balance, "history": history}

def add_points(points: int, reason: str):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Обновляем счетчик (%s вместо ?)
    cursor.execute("UPDATE user_balance SET balance = balance + %s WHERE id = 1", (points,))
    
    # Записываем историю (%s вместо ?)
    cursor.execute("INSERT INTO transactions (points, reason) VALUES (%s, %s)", (points, reason))
    
    conn.commit()
    
    cursor.execute("SELECT balance FROM user_balance WHERE id = 1")
    new_balance = cursor.fetchone()[0]
    
    cursor.close()
    conn.close()
    return new_balance

def reset_database():
    """Полный сброс: очищает таблицы и сбрасывает счетчики в PostgreSQL"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Очищаем содержимое таблиц и сбрасываем автоинкремент (RESTART IDENTITY)
    cursor.execute("TRUNCATE TABLE user_balance, transactions RESTART IDENTITY CASCADE;")
    
    # Создаем начальную запись с 0 очками
    cursor.execute("INSERT INTO user_balance (balance) VALUES (0)")
        
    conn.commit()
    cursor.close()
    conn.close()