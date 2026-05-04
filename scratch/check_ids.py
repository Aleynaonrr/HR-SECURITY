import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import app, db, User, Candidate, Application

with app.app_context():
    print("USERS:")
    for u in User.query.all():
        print(f"ID: {u.id}, Email: {u.email}")
        
    print("\nCANDIDATES:")
    for c in Candidate.query.all():
        print(f"ID: {c.id}, UserID: {c.user_id}")
        
    print("\nAPPLICATIONS:")
    for a in Application.query.all():
        print(f"ID: {a.id}, CandidateID: {a.candidate_id}")
