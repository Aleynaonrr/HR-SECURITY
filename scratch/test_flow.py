import requests
import json

BASE_URL = "http://localhost:5000"

def test_registration_and_login():
    email = "test_candidate_3@example.com"
    password = "Password123!"
    
    # 1. Register
    print("Registering...")
    reg_data = {
        "first_name": "Test",
        "last_name": "Candidate",
        "email": email,
        "password": password
    }
    res = requests.post(f"{BASE_URL}/register", json=reg_data)
    print(f"Register status: {res.status_code}")
    print(f"Register response: {res.text}")
    
    # 2. Login
    print("\nLogging in...")
    login_data = {
        "email": email,
        "password": password
    }
    res = requests.post(f"{BASE_URL}/login", json=login_data)
    print(f"Login status: {res.status_code}")
    print(f"Login response: {res.text}")

if __name__ == "__main__":
    try:
        test_registration_and_login()
    except Exception as e:
        print(f"Error: {e}")
