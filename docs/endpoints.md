# Vantage API — Frontend Integration Guide

**Base URL (Dev):** `http://localhost:8080`

**Auth:** All requests require `Authorization: Bearer vantage-dev-key-2026`

---

## Network Graph

```
GET /api/v1/graph/network?accountId=acc_001&limit=50
```

Returns nodes/edges for force-directed graph visualization.

```json
{
  "nodes": [
    { "id": "acc_001", "label": "Account", "type": "account", "tier": "GREEN", "ts": 0.82 },
    { "id": "acc_002", "label": "Account", "type": "account", "tier": "RED", "ts": 0.23 },
    { "id": "merch_001", "label": "Paystack", "type": "merchant", "tier": null, "ts": null }
  ],
  "edges": [
    { "source": "acc_001", "target": "merch_001", "amount": 5000, "riskFlag": null },
    { "source": "acc_002", "target": "merch_001", "amount": 200, "riskFlag": "velocity" }
  ]
}
```

**Viz hints:** Color nodes by tier (GREEN/AMBER/RED). Edge thickness by amount. Red edge if `riskFlag` present.

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
  "components": { "cpr": 0.91, "vvel": 0.12, "pdist": 0.05 },
  "explanation": {
    "verdict": "PASS",
    "summary": "Account has high network influence, normal transaction velocity, and no proximity to known fraud.",
    "risk_factors": [],
    "recommended_action": "No action needed"
  }
}
```

---

## Full Audit (Proof of Life)

```
POST /api/v1/audit/proof-of-life
```

**Request:**
```json
{
  "accountId": "acc_001",
  "merchantId": "merch_001",
  "amount": 5000,
  "transactionRef": "SQTEST123",
  "ipAddress": "192.168.1.1",
  "deviceFingerprint": "fp_abc123"
}
```

---

## Admin

| Action | Method | Path |
|--------|--------|------|
| Flag account | POST | `/api/v1/admin/flag/{accountId}` |
| Unflag account | POST | `/api/v1/admin/unflag/{accountId}` |
| List flagged | GET | `/api/v1/admin/flagged` |
| Batch import | POST | `/api/v1/admin/import/accounts` |

Batch import body:
```json
{
  "accounts": [
    { "id": "acc_001", "email": "a@b.com", "bvn": "12345678901", "deviceFingerprint": "fp_abc" }
  ]
}
```

---

## SSE Stream (Real-Time)

```
GET /api/v1/events
```

Connect with native `EventSource` — handles auto-reconnect.

```js
const events = new EventSource("http://localhost:8080/api/v1/events");

events.addEventListener("transaction", (e) => {
  const data = JSON.parse(e.data);
  // { accountId, merchantId, amount, tier }
  // Append to TransactionFeed
});

events.addEventListener("alert", (e) => {
  const data = JSON.parse(e.data);
  // { accountId, tier: "RED", ts, riskFactors }
  // Trigger RED PULSE on AlertPanel
});

events.addEventListener("flag_update", (e) => {
  const data = JSON.parse(e.data);
  // { accountId, isBlacklisted }
  // Update node badge in graph
});
```

---

## Suggested Component Tree (React)

```
src/
├── components/
│   ├── NetworkGraph.tsx        // D3 / vis-network
│   ├── TrustScoreCard.tsx      // Gauges + component bars
│   ├── TransactionFeed.tsx     // Real-time scrolling list
│   ├── AlertPanel.tsx          // Red Pulse overlay
│   └── AdminPanel.tsx          // Flagging controls
├── hooks/
│   ├── useSse.ts               // EventSource wrapper
│   └── useApi.ts               // Fetch + Auth header logic
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
