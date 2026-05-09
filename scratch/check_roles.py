import sqlite3
import os

db_path = "backend/instance/database.db"
if not os.path.exists(db_path):
    db_path = "backend/database.db"

print(f"Opening DB: {db_path}")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=== USERS ===")
cursor.execute("SELECT id, first_name, last_name, email, role FROM users")
for row in cursor.fetchall():
    print(row)

conn.close()
