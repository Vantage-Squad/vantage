import json
import hmac
import hashlib
import requests
import time
import random
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8081" # Change to your Render URL if needed
SQUAD_SECRET = "sandbox_sk_65e81c174e805616f637b682350faa79f5839e161"
VANTAGE_API_KEY = "vantage-dev-key-2026"

ACCOUNTS = [
    {"email": "amari@vantage.com", "id": "acc_001"},
    {"email": "semilore@vantage.com", "id": "acc_002"},
    {"email": "bankole@vantage.com", "id": "acc_003"},
    {"email": "mule_test@fraud.io", "id": "acc_mule"},
    {"email": "vendor_99@shop.ng", "id": "acc_vendor"}
]

def sign_body(body_str, secret):
    return hmac.new(
        secret.encode('utf-8'),
        body_str.encode('utf-8'),
        hashlib.sha512
    ).hexdigest()

def ingest_account(acc):
    url = f"{BASE_URL}/api/v1/ingest/account"
    headers = {"Authorization": f"Bearer {VANTAGE_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "id": acc["id"],
        "email": acc["email"],
        "bvn": "12345678901",
        "ipAddress": f"192.168.1.{random.randint(1, 255)}"
    }
    requests.post(url, json=payload, headers=headers)

def send_transaction(acc):
    amount = random.randint(500, 50000)
    ref = f"txn_{random.getrandbits(32)}"
    
    payload = {
        "TransactionRef": ref,
        "amount": str(amount),
        "email": acc["email"],
        "currency": "NGN",
        "transaction_status": "success"
    }
    
    body_str = json.dumps(payload, separators=(',', ':')) 
    signature = sign_body(body_str, SQUAD_SECRET)
    
    headers = {
        "X-Squad-Encrypted-Body": signature,
        "Content-Type": "application/json"
    }
    
    print(f"[LIVE] Sending {amount} NGN from {acc['email']}...")
    try:
        r = requests.post(f"{BASE_URL}/squad/webhook", data=body_str, headers=headers)
        return r.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    print("=== Vantage Live Demo Simulator ===")
    print(f"Targeting: {BASE_URL}")
    
    # Ensure accounts exist
    for acc in ACCOUNTS:
        ingest_account(acc)
    
    while True:
        # Select a random account
        acc = random.choice(ACCOUNTS)
        
        # 10% chance of a "Velocity Attack" (Mule behavior)
        if random.random() < 0.1:
            print(f"\n[!!!] TRIGGERING VELOCITY ANOMALY FOR {acc['email']}")
            for _ in range(8):
                send_transaction(acc)
                time.sleep(0.2)
        else:
            send_transaction(acc)
        
        # Sleep between 1 to 5 seconds
        wait = random.uniform(1.5, 4.0)
        time.sleep(wait)

if __name__ == "__main__":
    main()
