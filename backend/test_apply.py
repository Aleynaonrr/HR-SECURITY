import requests

base_url = "http://127.0.0.1:5000"

def run_test():
    # 1. Register
    email = "test_candidate123@example.com"
    password = "StrongPassword@123!"
    res = requests.post(f"{base_url}/register", json={
        "first_name": "Test",
        "last_name": "Candidate",
        "email": email,
        "password": password
    })
    print("Register:", res.status_code, res.text)
    
    # 2. Login
    res = requests.post(f"{base_url}/login", json={
        "email": email,
        "password": password
    })
    print("Login:", res.status_code)
    if res.status_code != 200:
        return
    token = res.json().get("token")
    
    # 3. Apply
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept-Language": "en"
    }
    payload = {
        "first_name": "Test",
        "last_name": "Candidate",
        "job": "Software Engineer",
        "school": "Test University",
        "department": "Computer Science",
        "salary": "100000"
    }
    res = requests.post(f"{base_url}/apply", json=payload, headers=headers)
    print("Apply:", res.status_code, res.text)

run_test()
