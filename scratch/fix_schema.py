import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import app, db
from sqlalchemy import inspect

with app.app_context():
    inspector = inspect(db.engine)
    columns = inspector.get_columns('users')
    column_names = [c['name'] for c in columns]
    print(f"Users columns: {column_names}")
    
    if 'hr_upgrade_attempts' not in column_names:
        print("Missing hr_upgrade_attempts! Recreating database...")
        db.drop_all()
        db.create_all()
        print("Database recreated.")
    else:
        print("Database schema is up to date.")
