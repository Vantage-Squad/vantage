# Vantage API — Frontend Integration Guide

**Base URL (Dev):** `http://localhost:8080`

**Auth:** All `/api/v1/*` requests require `Authorization: Bearer <token>`. Use `vantage-dev-key-2026` for dev. The `/health` and `/api/v1/admin/login` endpoints are unauthenticated.

---

## Auth

### Login

```
POST /api/v1/admin/login
```

**Request:**
```json
{ "email": "admin@vantage.com", "password": "your-password" }
```

**Response:**
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "expiresIn": 86400 }
```

Use the returned `token` as `Authorization: Bearer <token>` for all other requests.

---

## Account Ingestion

```
POST /api/v1/ingest/account
```

**Request:**
```json
{
  "id": "acc_001",
  "email": "user@example.com",
  "bvn": "12345678901",
  "nin": "98765432101",
  "deviceFingerprint": "fp_abc123",
  "ipAddress": "192.168.1.1"
}
```

**Response:** `201`
```json
{ "status": "created", "id": "acc_001" }
```

GeoIP enrichment (city/country) happens automatically when `ipAddress` is provided.

---

## Transaction Ingestion

```
POST /api/v1/ingest/transaction
```

**Request:**
```json
{
  "accountId": "acc_001",
  "counterpartyId": "merch_001",
  "amount": 5000,
  "currency": "NGN",
  "transactionRef": "TX12345",
  "sessionId": "sess_001",
  "counterpartyType": "MERCHANT"
}
```

`counterpartyType` enum: `MERCHANT`, `INDIVIDUAL`, `BILLER`, `VIRTUAL_ACCOUNT` (default: `MERCHANT`)

If the counterparty doesn't exist, it's auto-created.

**Response:** `201`
```json
{ "status": "created", "transactionRef": "TX12345" }
```

Trust score is automatically recalculated after ingest.

---

## Network Graph

```
GET /api/v1/graph/network?accountId=acc_001&limit=50
```

Both query params optional. Returns nodes/edges for force-directed graph visualization.

```json
{
  "nodes": [
    { "id": "acc_001", "type": "Account", "trustScore": 0.82, "isBlacklisted": false },
    { "id": "merch_001", "type": "Counterparty", "name": null, "isBlacklisted": false }
  ],
  "edges": [
    { "source": "acc_001", "target": "merch_001", "amount": 5000, "currency": "NGN" }
  ]
}
```

**Viz hints:** Color account nodes by `trustScore` (GREEN > 0.7, AMBER 0.4–0.7, RED < 0.4). Different shape/size for Account vs Counterparty. Edge thickness by `amount`. Red highlight if `isBlacklisted`.

---

## Trust Score Detail

```
GET /api/v1/trust/{accountId}
```

```json
{
  "accountId": "acc_001",
  "ts": 0.82,
  "tier": "GREEN",
  "cpr": 0.91,
  "vvel": 0.12,
  "pdist": 0.05,
  "explanation": {
    "verdict": "PASS",
    "summary": "Trust score 0.82 (GREEN). Risk factors: none detected.",
    "riskFactors": [],
    "recommendedAction": "Allow transaction"
  }
}
```

| Field | Meaning |
|-------|---------|
| `ts` | Overall trust score [0, 1] |
| `tier` | GREEN (> 0.7), AMBER (0.4–0.7), RED (< 0.4) |
| `cpr` | PageRank centrality [0, 1] |
| `vvel` | Transaction velocity [0, 1] |
| `pdist` | Proximity to blacklisted counterparties [0, 1] |
| `explanation.verdict` | PASS / FLAG / BLOCK |
| `riskFactors` | Array of human-readable risk strings |

**Formula:** `Ts = 0.35(cpr) + 0.40(vvel) - 0.25(pdist)`

---

## Full Audit (Proof of Life)

```
POST /api/v1/audit/proof-of-life
```

**Request:**
```json
{ "accountId": "acc_001" }
```

**Response:**
```json
{
  "accountId": "acc_001",
  "trustScore": 0.82,
  "tier": "GREEN",
  "verdict": "PASS",
  "summary": "Trust score 0.82 (GREEN). Risk factors: none detected.",
  "riskFactors": [],
  "recommendedAction": "Allow transaction"
}
```

---

## Cross-Reference Status

```
GET /api/v1/status/{transactionRef}
```

Returns Squad-side verification + Vantage status in one call.

```json
{
  "transactionRef": "TX12345",
  "squadVerification": {
    "status": 200,
    "success": true,
    "message": "Transaction found",
    "data": {
      "transaction_amount": 5000,
      "transaction_ref": "TX12345",
      "email": "user@example.com",
      "transaction_status": "success",
      "merchant_name": "Test Merchant",
      "merchant_id": "merch_001",
      "created_at": "2026-05-10T12:00:00Z"
    }
  },
  "vantage": "ok"
}
```

`squadVerification` will be `"not found"` if the transaction doesn't exist on Squad's side.

---

## Admin

| Action | Method | Path |
|--------|--------|------|
| Login | POST | `/api/v1/admin/login` |
| Flag account | POST | `/api/v1/admin/flag/{accountId}` |
| Unflag account | POST | `/api/v1/admin/unflag/{accountId}` |
| List flagged | GET | `/api/v1/admin/flagged` |
| Batch import | POST | `/api/v1/admin/import/accounts` |

### Flag / Unflag

```
POST /api/v1/admin/flag/acc_001
POST /api/v1/admin/unflag/acc_001
```

**Response:**
```json
{ "status": "flagged", "id": "acc_001" }
```

Emits a `flag_update` SSE event on each action.

### List Flagged Accounts

```
GET /api/v1/admin/flagged
```

**Response:**
```json
[
  {
    "id": "acc_001",
    "email": "user@example.com",
    "isBlacklisted": true,
    "trustScore": 0.23
  }
]
```

### Batch Import

```
POST /api/v1/admin/import/accounts
```

**Request:**
```json
{
  "accounts": [
    {
      "id": "acc_001",
      "email": "a@b.com",
      "bvn": "12345678901",
      "nin": "98765432101",
      "deviceFingerprint": "fp_abc",
      "ipAddress": "192.168.1.1"
    }
  ]
}
```

**Response:**
```json
{ "status": "imported", "count": 1 }
```

---

## SSE Stream (Real-Time)

```
GET /api/v1/events
```

Connect with native `EventSource` — handles auto-reconnect. Heartbeat every 30s.

```js
const events = new EventSource("http://localhost:8080/api/v1/events");

events.addEventListener("transaction", (e) => {
  const data = JSON.parse(e.data);
  // { accountId, amount, tier }
  // Append to TransactionFeed
});

events.addEventListener("alert", (e) => {
  const data = JSON.parse(e.data);
  // { accountId, tier: "RED", ts, riskFactors }
  // Trigger RED PULSE on AlertPanel
});

events.addEventListener("flag_update", (e) => {
  const data = JSON.parse(e.data);
  // { accountId, isBlacklisted, reason }
  // Update node badge in graph
});
```

---

## Suggested Component Tree (React)

```
src/
├── components/
│   ├── NetworkGraph.tsx        // Cytoscape.js force-directed graph
│   ├── TrustScoreCard.tsx      // Gauges + component bars (cpr, vvel, pdist)
│   ├── TransactionFeed.tsx     // Real-time SSE scrolling list
│   ├── AlertPanel.tsx          // Red Pulse overlay on RED tier
│   └── AdminPanel.tsx          // Flagging controls + batch import
├── hooks/
│   ├── useSse.ts               // EventSource wrapper
│   └── useApi.ts               // Fetch + Auth header logic
└── pages/
    └── Auth.tsx                // Login form → stores token in localStorage
```

## Red Pulse CSS

```css
@keyframes red-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
}
.alert-red {
  animation: red-pulse 1.5s infinite;
  border-color: #ef4444;
}
```
