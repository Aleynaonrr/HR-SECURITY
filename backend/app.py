from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables from .env file before importing app modules
# This ensures database credentials, secret keys, and encryption keys are available at startup
load_dotenv()

from models import db, User, Candidate, Application, init_db
from middleware import generate_token, token_required, hr_required, log_action
from config import DevelopmentConfig
from utils_security import SecurityManager

app = Flask(__name__)
app.config.from_object(DevelopmentConfig)

# Enable Cross-Origin Resource Sharing so the frontend can communicate with the API
CORS(app)

# Bind SQLAlchemy to this Flask application instance
db.init_app(app)

# Create all database tables defined in models if they don't already exist
with app.app_context():
    db.create_all()


# --- AUTHENTICATION: User Registration ---
# Allows new users to create an account with the default role "Candidate"
# Passwords are never stored in plaintext — set_password() hashes them securely (e.g., scrypt)
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided!"}), 400

        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        password = data.get("password")

        # Validate that all required fields are present
        if not all([first_name, last_name, email, password]):
            return jsonify({"error": "All fields are required!"}), 400

        # Validate email format using SecurityManager
        if not SecurityManager.validate_email(email):
            return jsonify({"error": "Invalid email format!"}), 400

        # Validate password strength using SecurityManager
        if not SecurityManager.validate_password(password):
            return jsonify({"error": "Password must be at least 8 characters and contain uppercase, lowercase, digit and special character!"}), 400

        # Prevent duplicate accounts by checking if the email is already registered
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "User with this email already exists!"}), 409

        new_user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            role="Candidate"  # Default role assigned to every new registrant
        )
        # Hash and store the password securely
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        # Log the registration event
        log_action(new_user.id, "USER_REGISTERED", "Auth")

        return jsonify({"message": "Registration successful!"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Registration Error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500


from datetime import datetime, timedelta

# --- ACCESS CONTROL: HR Direct Login ---
# Allows HR to login directly or upgrade from Candidate if they have the code
@app.route("/hr/login", methods=["POST"])
def hr_login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    secret_code = data.get("secret_code")
    lang = request.headers.get("Accept-Language", "en")

    if not email or not password or not secret_code:
        return jsonify({"error": "E-posta, şifre ve yetki kodu zorunludur!" if lang == 'tr' else "Email, password, and security code required!"}), 400

    user = User.query.filter_by(email=email).first()

    # check_password() compares the submitted password against the stored hash
    if not user or not user.check_password(password):
        return jsonify({"error": "Geçersiz kimlik bilgileri!" if lang == 'tr' else "Invalid credentials!"}), 401

    if user.role == "HR":
        # Already HR, ignore code and login
        token = generate_token(user.id, user.first_name, user.last_name, user.role)
        from middleware import log_action
        log_action(user.id, "HR_LOGIN_SUCCESS", "Auth")
        return jsonify({
            "token": token,
            "role": user.role,
            "user": {
                "first_name": user.first_name,
                "last_name": user.last_name
            }
        }), 200

    # SECURITY: Domain Whitelisting
    allowed_domain = "@hr-soft.com"
    if not user.email.endswith(allowed_domain):
        from middleware import log_action
        log_action(user.id, "UNAUTHORIZED_HR_LOGIN_ATTEMPT_WRONG_DOMAIN", f"Email: {user.email}")
        return jsonify({
            "error": "Yetkisiz erişim denemesi!" if lang == 'tr' else "Unauthorized access attempt!"
        }), 403

    # Check if user is currently locked out
    if user.hr_upgrade_lockout_until and user.hr_upgrade_lockout_until > datetime.utcnow():
        remaining_time = user.hr_upgrade_lockout_until - datetime.utcnow()
        minutes = int(remaining_time.total_seconds() / 60)
        return jsonify({
            "error": f"Çok fazla hatalı deneme! Hesabınız {minutes} dakika kilitlendi." if lang == 'tr' else f"Too many failed attempts! Your account is locked for {minutes} more minutes."
        }), 403

    # Verify the secret authorization code
    correct_code = os.getenv("HR_SECRET_CODE")
    
    if secret_code != correct_code:
        # Increment failed attempts
        user.hr_upgrade_attempts += 1
        
        if user.hr_upgrade_attempts >= 3:
            # Lock the account for 1 hour
            user.hr_upgrade_lockout_until = datetime.utcnow() + timedelta(hours=1)
            db.session.commit()
            return jsonify({
                "error": "3 hatalı deneme! Erişim 1 saatliğine kısıtlandı." if lang == 'tr' else "3 failed attempts! Access restricted for 1 hour."
            }), 403
        
        db.session.commit()
        remaining = 3 - user.hr_upgrade_attempts
        return jsonify({
            "error": f"Geçersiz İK kodu! Kalan hakkınız: {remaining}" if lang == 'tr' else f"Invalid HR code! {remaining} attempts remaining."
        }), 403

    # Success: Reset attempts and lockout, upgrade role
    user.hr_upgrade_attempts = 0
    user.hr_upgrade_lockout_until = None
    user.role = "HR"
    db.session.commit()

    # Generate token and log success
    token = generate_token(user.id, user.first_name, user.last_name, user.role)
    from middleware import log_action
    log_action(user.id, "ROLE_UPGRADE_AND_LOGIN_SUCCESS", "HR_Access")

    return jsonify({
        "token": token,
        "role": user.role,
        "user": {
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    }), 200


# --- AUTHENTICATION: User Login ---
# Validates credentials and issues a JWT token that encodes the user's id, name, and role.
# The token is used by all subsequent protected routes to verify identity and enforce RBAC.
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required!"}), 400

    user = User.query.filter_by(email=email).first()

    # check_password() compares the submitted password against the stored hash
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials!"}), 401

    # Generate a signed JWT containing the user's role for downstream access control checks
    token = generate_token(user.id, user.first_name, user.last_name, user.role)
    
    # Log the login event
    log_action(user.id, "USER_LOGIN_SUCCESS", "Auth")

    return jsonify({
        "token": token,
        "role": user.role,
        "user": {
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    }), 200


# --- ACCESS CONTROL + ENCRYPTION: Submit Job Application ---
# Protected route — requires a valid JWT (@token_required).
# Only users with the "Candidate" role are permitted; HR users are blocked (RBAC enforcement).
# The expected salary is encrypted with Fernet/AES-128 before being stored to protect sensitive data.
@app.route("/apply", methods=["POST"])
@token_required
def apply():
    lang = request.headers.get("Accept-Language", "en")
    # RBAC check: only Candidates may submit applications
    if request.user["role"] != "Candidate":
        return jsonify({"error": "Sadece adaylar başvuru yapabilir!" if lang == 'tr' else "Only candidates can apply!"}), 403

    data = request.get_json()
    user_id = request.user["id"]

    first_name = data.get("first_name")
    last_name = data.get("last_name")
    job = data.get("job")
    school = data.get("school")
    department = data.get("department")
    salary = data.get("salary")

    if not all([first_name, last_name, job, school, department, salary]):
        return jsonify({"error": "All fields are required!"}), 400

    # Create a Candidate profile for this user if one does not already exist
    candidate = Candidate.query.filter_by(user_id=user_id).first()
    if not candidate:
        candidate = Candidate(
            user_id=user_id,
            full_name=f"{first_name} {last_name}",
            position=job,
            department=department,
            school=school
        )
        db.session.add(candidate)
        db.session.commit()

    # Prevent a candidate from submitting more than one application
    existing_app = Application.query.filter_by(candidate_id=candidate.id).first()
    if existing_app:
        return jsonify({"error": "You have already submitted an application!"}), 400

    # ENCRYPTION: Encrypt the salary before storing it in the database.
    # SecurityManager uses symmetric encryption (Fernet/AES-128) so the value can be decrypted later.
    encrypted_salary = SecurityManager.encrypt_data(salary)

    new_app = Application(
        candidate_id=candidate.id,
        position=job,
        department=department,
        school=school,
        salary_expected=encrypted_salary  # Only the ciphertext is persisted — never plaintext
    )

    db.session.add(new_app)
    db.session.commit()

    # Log job application submission
    log_action(user_id, "JOB_APPLICATION_SUBMITTED", f"App_ID: {new_app.id}")

    return jsonify({"message": "Application submitted successfully!"}), 201


# --- ACCESS CONTROL + ENCRYPTION: Candidate Views Their Own Application ---
# Protected route — requires a valid JWT (@token_required).
# RBAC: only the "Candidate" role may access this endpoint.
# The encrypted salary is decrypted at retrieval time so the candidate can see their own data.
@app.route("/candidate/application", methods=["GET"])
@token_required
def get_my_application():
    lang = request.headers.get("Accept-Language", "en")
    # RBAC check: HR users cannot access candidate-specific routes
    if request.user["role"] != "Candidate":
        return jsonify({"error": "Bu sayfaya sadece adaylar erişebilir!" if lang == 'tr' else "Only candidates can access this route!"}), 403

    user_id = request.user["id"]
    candidate = Candidate.query.filter_by(user_id=user_id).first()

    if not candidate:
        return jsonify({"application": None}), 200

    app_row = Application.query.filter_by(candidate_id=candidate.id).first()

    if not app_row:
        return jsonify({"application": None}), 200

    # ENCRYPTION: Decrypt the stored salary for display.
    # If decryption fails (e.g., key mismatch), fall back to a masked placeholder.
    decrypted_salary = "Hidden"
    if app_row.salary_expected:
        try:
            decrypted_salary = SecurityManager.decrypt_data(app_row.salary_expected)
        except Exception:
            pass

    user = candidate.user
    return jsonify({
        "application": {
            "id": app_row.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "job": app_row.position,
            "school": app_row.school,
            "department": app_row.department,
            "salary": decrypted_salary,  # Plaintext salary returned only to the owning candidate
            "status": app_row.status
        }
    }), 200


# --- ACCESS CONTROL + ENCRYPTION: HR Lists All Candidates (Admin-Only Page) ---
# Protected by @hr_required — the decorator verifies the JWT and checks that role == "HR".
# This is the admin-only endpoint; any non-HR request is rejected before reaching this logic.
# Encrypted salary fields are decrypted here so HR staff can review full application details.
@app.route("/hr/candidates", methods=["GET"])
@hr_required
def get_all_candidates():
    applications = Application.query.all()
    result = []
    for app_row in applications:
        candidate = app_row.candidate
        if not candidate or not candidate.user:
            continue
            
        user = candidate.user

        # ENCRYPTION: Decrypt each candidate's salary for HR review
        decrypted_salary = ""
        if app_row.salary_expected:
            try:
                decrypted_salary = SecurityManager.decrypt_data(app_row.salary_expected)
            except Exception:
                decrypted_salary = "[DECRYPTION ERROR]"

        result.append({
            "id": app_row.id,
            "name": f"{user.first_name} {user.last_name}",
            "position": app_row.position,
            "evaluator_name": "System",  # Placeholder — will be replaced with actual reviewer logic
            "decrypted_salary": decrypted_salary,
            "secret_note": app_row.notes,
            "status": app_row.status
        })
    
    # Log HR access to candidate list (Security Audit)
    log_action(request.user["id"], "HR_VIEWED_ALL_CANDIDATES", "Candidate_List")

    return jsonify(result), 200


# --- ACCESS CONTROL: HR Dashboard Statistics (Admin-Only) ---
# Returns aggregate metrics (total applications, pending reviews, alerts).
# @hr_required ensures only authenticated HR/admin users can retrieve this data.
@app.route("/hr/stats", methods=["GET"])
@hr_required
def get_hr_stats():
    applications = Application.query.all()
    # Filter out corrupted records where candidate or user is missing
    valid_applications = [a for a in applications if a.candidate and a.candidate.user]
    
    pending = [a for a in valid_applications if a.status == 'submitted']
    reviewed = [a for a in valid_applications if a.status != 'submitted']
    
    return jsonify({
        "reviewedApplications": len(reviewed),
        "unreviewedApplications": len(pending)
    }), 200


# --- ACCESS CONTROL: HR Adds a Review Note to an Application (Admin-Only) ---
# @hr_required enforces that only HR/admin users can annotate candidate applications.
# Also records which HR user performed the review and updates the application status.
@app.route("/hr/candidates/<int:candidate_id>/note", methods=["POST"])
@hr_required
def add_note(candidate_id):
    data = request.get_json()
    note = data.get("note", "")
    status = data.get("status", "")

    app_row = Application.query.get(candidate_id)
    if app_row:
        if note is not None:
            app_row.notes = note
        if status:
            app_row.status = status
        elif app_row.status == 'submitted':
            app_row.status = 'reviewing'  # Move application to "under review" state if no explicit status is provided
            
        app_row.reviewed_by = request.user["id"]  # Track which HR user added the note
        db.session.commit()
        return jsonify({"message": "Note and status updated successfully!"}), 200
    return jsonify({"error": "Application not found"}), 404


if __name__ == "__main__":
    # Run the development server — debug=True enables auto-reload and detailed error pages
    app.run(debug=True, host='0.0.0.0')