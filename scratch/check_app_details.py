import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import app, db, Application, Candidate, User

with app.app_context():
    apps = Application.query.all()
    print(f"Total applications: {len(apps)}")
    for app_row in apps:
        candidate = Candidate.query.get(app_row.candidate_id)
        user = User.query.get(candidate.user_id)
        print(f"App ID: {app_row.id}, Candidate: {user.email}, Position: {app_row.position}")
