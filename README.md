# HR-Soft: Secure Human Resources Management System

## 📌 About the Project
HR-Soft is a platform that offers modern recruitment processes and employee data management with the highest security standards. All processes, from candidate applications to the HR management panel, are designed with a focus on efficiency and data privacy.

## 👥 Contributors
* **Büşra Ceylan** - Frontend Developer - [@busracode](https://github.com/busracode)
* **Aleyna Öner** - Backend Developer - [@Aleynaonrr](https://github.com/Aleynaonrr)

## 🛠 Technology Stack
- **Frontend:** React.js, Tailwind CSS, Axios
- **Backend:** Python Flask, SQLAlchemy
- **Security:** Bcrypt (Password Hashing), Cryptography.Fernet (AES-128 Data Encryption), JWT (Authentication)
- **Database:** SQLite

## 📁 File Structure

### Project Overview
```text
HR-Soft/
├── backend/            # API services and database management
├── frontend/           # User interface and client-side logic
└── README.md           # Project documentation
```

### Backend (Flask)
- `app.py`: Main API routes and application entry point.
- `models.py`: Database schemas (User, Candidate, Application) and ORM definitions.
- `utils_security.py`: Encryption (AES), decryption, and password hashing (Bcrypt) tools.
- `middleware.py`: Role-Based Access Control (RBAC) and token validation.
- `config.py`: Application configuration and security keys.

### Frontend (React)
- `src/components/`: Common components such as Navbar, Sidebar, and Layout.
- `src/pages/`: Page views like Login, Register, Dashboard, and AdminPanel.
- `src/services/`: Axios services for API communication.
- `src/context/`: AuthContext for managing user sessions and permissions.
- `src/utils/`: Helper functions for the frontend.

## 🔐 Security Philosophy

Our system is built on the "Security by Design" principle.

### 1. End-to-End Data Privacy (AES-128)
Sensitive data (e.g., Salary expectations or Contact information) is encrypted using the **AES-128 (Fernet)** standard before being saved to the database. Even if the database is leaked, these data are completely meaningless character strings without the server-side `ENCRYPTION_KEY`.

### 2. Secure Authentication (Bcrypt)
User passwords are stored by hashing them with the **Bcrypt** algorithm, which is resistant to rainbow tables and brute-force attacks.

### 3. Role-Based Access Control (RBAC)
There are two main authorization levels in the system:
- **Candidate:** Can only see their own application. Their own sensitive data is presented as masked in the system.
- **HR Representative:** Can access the entire candidate list. Sensitive data is only sent to users in this role after being decrypted on the server side.

### 4. Advanced Threat Protection
- **Brute-Force Prevention:** The account is temporarily locked after a certain number of failed attempts.
- **JWT Security:** Sessions are managed via secure tokens, and every API request undergoes authorization control on the server side.
- **Access Codes:** Access to the HR panel has an additional layer of security with special authorization codes verified by the backend.

### 5. Layered Defense
Security is provided not only on the client side (frontend) but primarily on the server side (backend) through middleware layers. Unauthorized API calls are directly rejected with 401/403 errors.

## Running the Project

### Terminal 1 - Backend Server
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

### Terminal 2 - Frontend Server
```bash
cd frontend
npm start
```


---
*This project has been prepared in accordance with secure software development standards.*
