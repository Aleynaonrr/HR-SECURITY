import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import app, db, Application, Candidate, User

with app.app_context():
    # Find candidates with missing users
    candidates = Candidate.query.all()
    for c in candidates:
        user = User.query.get(c.user_id)
        if not user:
            print(f"Deleting orphan candidate ID {c.id} (UserID {c.user_id})")
            db.session.delete(c)
            
    # Find applications with missing candidates
    apps = Application.query.all()
    for a in apps:
        candidate = Candidate.query.get(a.candidate_id)
        if not candidate:
            print(f"Deleting orphan application ID {a.id}")
            db.session.delete(a)
            
    db.session.commit()
    print("Cleanup complete.")
