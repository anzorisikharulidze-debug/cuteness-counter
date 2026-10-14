import sqlite3

DB_NAME = "server/cuteness.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Таблица для текущего баланса очков
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_balance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            balance INTEGER NOT NULL DEFAULT 0
        )
    """)
    
    # Таблица для истории начислений (очки, причина/аргумент, дата)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    conn.close()

def get_current_state():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute("SELECT balance FROM user_balance WHERE id = 1")
    balance = cursor.fetchone()[0]
    
    cursor.execute("SELECT points, reason, created_at FROM transactions ORDER BY created_at DESC LIMIT 10")
    history = [
        {"points": row[0], "reason": row[1], "created_at": row[2]} 
        for row in cursor.fetchall()
    ]
    
    conn.close()
    return {"balance": balance, "history": history}

def add_points(points: int, reason: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Обновляем счетчик
    cursor.execute("UPDATE user_balance SET balance = balance + ? WHERE id = 1", (points,))
    
    # Записываем историю
    cursor.execute("INSERT INTO transactions (points, reason) VALUES (?, ?)", (points, reason))
    
    conn.commit()
    
    cursor.execute("SELECT balance FROM user_balance WHERE id = 1")
    new_balance = cursor.fetchone()[0]
    
    conn.close()
    return new_balance

def reset_database():
    """Полный сброс: очищает таблицы user_balance и transactions и возвращает баланс к 0"""
    conn = sqlite3.connect(DB_NAME)  # Используем правильную константу "server/cuteness.db"
    cursor = conn.cursor()
    
    # Очищаем содержимое таблиц
    cursor.execute("DELETE FROM user_balance;")
    cursor.execute("DELETE FROM transactions;")
    
    # Сбрасываем автоинкремент (чтобы id начинались с 1)
    cursor.execute("DELETE FROM sqlite_sequence WHERE name='user_balance';")
    cursor.execute("DELETE FROM sqlite_sequence WHERE name='transactions';")
    
    # Создаем начальную запись с 0 очками
    cursor.execute("INSERT INTO user_balance (balance) VALUES (0)")
        
    conn.commit()
    conn.close()