import sqlite3
import os

db_path = "backend/instance/database.db"
if not os.path.exists(db_path):
    db_path = "backend/database.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=== TABLE INFO: users ===")
cursor.execute("PRAGMA table_info(users)")
for row in cursor.fetchall():
    print(row)

conn.close()
