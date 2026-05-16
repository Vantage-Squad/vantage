import requests
import time
import random
import uuid
from datetime import datetime
import os
import hmac
import hashlib
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../server/.env'))

BASE_URL = os.getenv("API_URL", "https://vantage-v68w.onrender.com")
SQUAD_SECRET = os.getenv("SQUAD_SECRET_KEY", "sandbox_sk_65e81c174e805616f637b682350faa79f5839e161")

# Personas to simulate different risk patterns
PERSONAS = [
    {
        "name": "Sarah Miller",
        "email": "sarah.m@example.com",
        "bvn": "22233344455",
        "risk_profile": "low",
        "ips": ["192.168.1.50", "102.89.34.12"],
        "avg_amount": 5000
    },
    {
        "name": "Ibrahim Yusuf",
        "email": "ibrahim.y@gmail.com",
        "bvn": "55566677788",
        "risk_profile": "moderate",
        "ips": ["197.210.64.5", "41.203.112.9"],
        "avg_amount": 3000
    },
    {
        "name": "Shadow Node 09",
        "email": "shadow.node@darknet.com",
        "bvn": "99900011122",
        "risk_profile": "high",
        "ips": ["185.220.101.44", "45.14.71.22"],
        "avg_amount": 150000
    }
]

COUNTERPARTIES = [
    {"id": "CP_001", "name": "Mainland Supermarket", "type": "MERCHANT"},
    {"id": "CP_002", "name": "Global Crypto Exchange", "type": "EXCHANGE"},
    {"id": "CP_003", "name": "Unknown Wallet X", "type": "INDIVIDUAL"},
    {"id": "CP_004", "name": "Lagos Casino", "type": "GAMBLING"}
]

def send_transaction(persona):
    tx_ref = f"VTX_{uuid.uuid4().hex[:8].upper()}"
    amount = random.randint(500, 5000)
    
    # High risk personas send larger, more suspicious amounts
    if persona["risk_profile"] == "high":
        amount = random.randint(50000, 200000)
        
    cp = random.choice(COUNTERPARTIES)
    
    payload = {
        "TransactionRef": tx_ref,
        "amount": str(amount),
        "email": persona["email"],
        "bvn": persona["bvn"],
        "ipAddress": random.choice(persona["ips"]),
        "counterpartyId": cp["id"],
        "counterpartyName": cp["name"],
        "timestamp": datetime.now().isoformat()
    }
    
    # Calculate real HMAC signature using the Squad Secret Key
    payload_json = json.dumps(payload, separators=(',', ':'))
    signature = hmac.new(
        SQUAD_SECRET.encode('utf-8'),
        payload_json.encode('utf-8'),
        hashlib.sha512
    ).hexdigest()
    
    headers = {
        "X-Squad-Encrypted-Body": signature,
        "Content-Type": "application/json"
    }
    
    try:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Sending tx {tx_ref} for {persona['name']}...")
        print(f"    Amount: {amount} | Destination: {cp['name']}")
        
        response = requests.post(
            f"{BASE_URL}/squad/webhook",
            data=payload_json,
            headers=headers
        )
        
        if response.status_code == 200:
            res_data = response.json()
            tier = res_data.get("tier", "UNKNOWN")
            color = "\033[92m" # Green
            if tier == "HIGH_RISK": color = "\033[93m" # Yellow
            if tier == "CRITICAL": color = "\033[91m" # Red
            
            print(f"    Result: {color}{tier}\033[0m")
        else:
            print(f"    Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"    Failed to connect to server: {e}")

def start_demo_seeder():
    print("\033[94m" + "="*50 + "\033[0m")
    print("\033[94m VANTAGE REAL-TIME DEMO SEEDER \033[0m")
    print("\033[94m" + "="*50 + "\033[0m")
    print(f"Target Server: {BASE_URL}")
    print("Press Ctrl+C to stop.\n")
    
    try:
        while True:
            # Randomly pick a persona, but skew towards "high" for demo excitement
            persona = random.choices(PERSONAS, weights=[40, 40, 20], k=1)[0]
            send_transaction(persona)
            
            # Wait between transactions
            interval = random.randint(3, 8)
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\nSeeder stopped.")

if __name__ == "__main__":
    start_demo_seeder()
