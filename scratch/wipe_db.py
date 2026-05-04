import os

db_path = r'c:\Users\bsrac\OneDrive\Masaüstü\HR-Soft\backend\database.db'
if os.path.exists(db_path):
    os.remove(db_path)
    print(f"Deleted {db_path}")

# Also check for recruitment.db just in case
db_path2 = r'c:\Users\bsrac\OneDrive\Masaüstü\HR-Soft\backend\recruitment.db'
if os.path.exists(db_path2):
    os.remove(db_path2)
    print(f"Deleted {db_path2}")
