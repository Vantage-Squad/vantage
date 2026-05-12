import json
import hmac
import hashlib
import requests
import time
from datetime import datetime

# Configuration from .env
BASE_URL = "http://localhost:8081"
VANTAGE_API_KEY = "vantage-dev-key-2026"
SQUAD_SECRET = "sandbox_sk_65e81c174e805616f637b682350faa79f5839e161"

def sign_body(body_str, secret):
    return hmac.new(
        secret.encode('utf-8'),
        body_str.encode('utf-8'),
        hashlib.sha512
    ).hexdigest()

def ingest_account(email, account_id):
    print(f"\n[+] Ingesting account: {email}")
    url = f"{BASE_URL}/api/v1/ingest/account"
    headers = {
        "Authorization": f"Bearer {VANTAGE_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "id": account_id,
        "email": email,
        "bvn": "12345678901",
        "ipAddress": "192.168.1.1"
    }
    r = requests.post(url, json=payload, headers=headers)
    print(f"    Status: {r.status_code}, Body: {r.text}")

def send_webhook(email, amount, ref):
    print(f"\n[+] Sending Squad Webhook: {ref} for {email} ({amount} NGN)")
    url = f"{BASE_URL}/squad/webhook"
    payload = {
        "TransactionRef": ref,
        "amount": str(amount),
        "email": email,
        "currency": "NGN",
        "transaction_status": "success"
    }
    # Important: separators=(',', ':') to match Ktor's JSON output/input for signature verification
    body_str = json.dumps(payload, separators=(',', ':')) 
    signature = sign_body(body_str, SQUAD_SECRET)
    
    headers = {
        "X-Squad-Encrypted-Body": signature,
        "Content-Type": "application/json"
    }
    r = requests.post(url, data=body_str, headers=headers)
    print(f"    Status: {r.status_code}, Body: {r.text}")

def check_trust(account_id):
    print(f"\n[?] Checking Trust Score & AI Explanation for {account_id}...")
    url = f"{BASE_URL}/api/v1/trust/{account_id}"
    headers = {"Authorization": f"Bearer {VANTAGE_API_KEY}"}
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        data = r.json()
        print(f"    Score: {data['ts']} ({data['tier']})")
        print(f"    AI Verdict: {data['explanation']['verdict']}")
        print(f"    AI Summary: {data['explanation']['summary']}")
        print(f"    Risk Factors: {data['explanation']['riskFactors']}")
    else:
        print(f"    Error: {r.status_code}, {r.text}")

def main():
    # Scenario 1: Clean User
    clean_email = "clean@vantage.com"
    ingest_account(clean_email, "acc_clean")
    send_webhook(clean_email, 5000, f"txn_clean_{int(time.time())}")
    check_trust("acc_clean")

    # Scenario 2: Velocity Alert (Mule Behavior)
    mule_email = "mule@vantage.com"
    ingest_account(mule_email, "acc_mule")
    print("\n[!] Sending 10 rapid transactions...")
    for i in range(10):
        send_webhook(mule_email, 1000, f"txn_mule_{i}_{int(time.time())}")
    check_trust("acc_mule")

    # Scenario 3: Network Risk
    print("\n[+] Setting up Network Risk Scenario...")
    risk_email = "risky@vantage.com"
    ingest_account(risk_email, "acc_risky")
    
    # Ingest a transaction to a specific merchant manually
    url = f"{BASE_URL}/api/v1/ingest/transaction"
    headers = {"Authorization": f"Bearer {VANTAGE_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "accountId": "acc_risky",
        "counterpartyId": "merchant_bad",
        "counterpartyType": "MERCHANT",
        "amount": 10000,
        "transactionRef": "txn_bad_seed"
    }
    requests.post(url, json=payload, headers=headers)
    
    print("    [!] Flagging merchant_bad via admin...")
    # Flag that merchant as blacklisted
    # We use an account as the bad counterparty for this test
    ingest_account("bad@actor.com", "acc_bad")
    requests.post(f"{BASE_URL}/api/v1/admin/flag/acc_bad", headers={"Authorization": f"Bearer {VANTAGE_API_KEY}"})
    
    # Link risky user to bad actor
    payload["counterpartyId"] = "acc_bad"
    payload["transactionRef"] = f"txn_network_risk_{int(time.time())}"
    requests.post(url, json=payload, headers=headers)
    
    check_trust("acc_risky")

if __name__ == "__main__":
    main()
