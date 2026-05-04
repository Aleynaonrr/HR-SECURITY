import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import app, db, Application, Candidate

with app.app_context():
    apps = Application.query.all()
    candidates = Candidate.query.all()
    print(f"Total candidates: {len(candidates)}")
    print(f"Total applications: {len(apps)}")
