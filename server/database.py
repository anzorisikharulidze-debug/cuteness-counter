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

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS access_requests (
            user_id BIGINT PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    task_tables = ["tasks", "adult_tasks"]
    for table in task_tables:
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {table} (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                reward INTEGER NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT FALSE,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                cooldown_until TIMESTAMP
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


# Проверка и добавление запроса доступа
def request_user_access(user_id: int, username: str | None, first_name: str | None, last_name: str | None) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    
    # Проверяем, существует ли уже запрос от этого пользователя
    cursor.execute("SELECT user_id FROM access_requests WHERE user_id = %s", (user_id,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return "exists"
    
    # Если нет — записываем новый запрос
    cursor.execute(
        """
        INSERT INTO access_requests (user_id, username, first_name, last_name)
        VALUES (%s, %s, %s, %s)
        """,
        (user_id, username, first_name, last_name)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return "success"

def get_transactions_history():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Забираем только транзакции из отдельной таблицы
    cursor.execute("SELECT points, reason, created_at FROM transactions ORDER BY created_at DESC")
    history = [
        {"points": r[0], "reason": r[1], "created_at": r[2].isoformat() if r[2] else None} 
        for r in cursor.fetchall()
    ]
    
    cursor.close()
    conn.close()
    return history

def get_tasks(is_adult: bool = False):
    """Получает список всех заданий из нужной таблицы"""
    table = "adult_tasks" if is_adult else "tasks"
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute(f"SELECT id, title, reward, completed, is_active, created_at, cooldown_until FROM {table} ORDER BY id ASC")
    tasks = [
        {
            "id": r[0],
            "title": r[1],
            "reward": r[2],
            "completed": r[3],
            "is_active": r[4],
            "created_at": r[5].isoformat() if r[5] else None,
            "cooldown_until": r[6].isoformat() if r[6] else None
        }
        for r in cursor.fetchall()
    ]
    
    cursor.close()
    conn.close()
    return tasks

def add_task(title: str, reward: int, is_adult: bool = False):
    """Создает новое задание с дефолтными значениями"""
    table = "adult_tasks" if is_adult else "tasks"
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        f"INSERT INTO {table} (title, reward, completed, is_active) VALUES (%s, %s, FALSE, TRUE)",
        (title, reward)
    )
    conn.commit()
    cursor.close()
    conn.close()

def toggle_task_status(task_id: int, is_adult: bool = False):
    """
    Инвертирует статус задания (completed: true <-> false).
    Если задание снова становится активным, сбрасываем cooldown_until в NULL.
    """
    table = "adult_tasks" if is_adult else "tasks"
    conn = get_connection()
    cursor = conn.cursor()
    
    # Сначала узнаем текущий статус
    cursor.execute(f"SELECT completed FROM {table} WHERE id = %s", (task_id,))
    row = cursor.fetchone()
    if not row:
        cursor.close()
        conn.close()
        raise ValueError("Задание не найдено")
    
    current_status = row[0]
    new_status = not current_status
    
    # Если делаем выполненным — можно ставить кулдаун, если невыполненным — сбрасывать
    if new_status:
        cursor.execute(
            f"""
            UPDATE {table} 
            SET completed = TRUE, 
                cooldown_until = CURRENT_TIMESTAMP + INTERVAL '23 hours' 
            WHERE id = %s
            """,
            (task_id,)
        )
    else:
        cursor.execute(
            f"""
            UPDATE {table} 
            SET completed = FALSE, 
                cooldown_until = NULL 
            WHERE id = %s
            """,
            (task_id,)
        )
        
    conn.commit()
    
    # Забираем обновленное задание, чтобы вернуть его
    cursor.execute(f"SELECT id, title, reward, completed, is_active, created_at, cooldown_until FROM {table} WHERE id = %s", (task_id,))
    r = cursor.fetchone()
    updated_task = {
        "id": r[0],
        "title": r[1],
        "reward": r[2],
        "completed": r[3],
        "is_active": r[4],
        "created_at": r[5].isoformat() if r[5] else None,
        "cooldown_until": r[6].isoformat() if r[6] else None
    }
    
    cursor.close()
    conn.close()
    return updated_task

def reset_tasks_table(is_adult: bool = False):
    """Очищает и сбрасывает автоинкремент конкретной таблицы задач"""
    table = "adult_tasks" if is_adult else "tasks"
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;")
    
    conn.commit()
    cursor.close()
    conn.close()