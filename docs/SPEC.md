# Vantage — Server Spec

## Prerequisites

Before running the server, you need:

| Item | What to do | Required? |
|------|-----------|-----------|
| Docker Desktop | Install and start Docker on your machine | **Yes** (runs Memgraph) |
| Java 21 JDK | Install JDK 21 (e.g. Amazon Corretto, Eclipse Temurin) | **Yes** |
| `.env` file | Copy `server/.env.example` → `server/.env` and fill in values | **Yes** |
| Squad sandbox keys | Sign up at [Squad sandbox](https://sandbox-api-d.squadco.com) for `SQUAD_SECRET_KEY` and `SQUAD_PUBLIC_KEY` | For Squad features |
| Gemini API key | Get one at [aistudio.google.com](https://aistudio.google.com) for `GEMINI_API_KEY` | For AI explanations |
| Ollama | Install [Ollama](https://ollama.com) and pull a model (e.g. `ollama pull llama3.1:8b`) | For local AI fallback |
| Admin password hash | Generate SHA-256 hex of your admin password: `echo -n "your-password" | sha256sum` | **Yes** |
| Ngrok (optional) | For receiving real Squad webhooks in development | For webhook testing |

### Quick start

```bash
# 1. Start Memgraph
docker compose up -d

# 2. Configure env
cp server/.env.example server/.env
# Edit server/.env with your values

# 3. Run the server
cd server && ./gradlew run

# 4. Verify
curl http://localhost:8080/health
# → {"status":"ok","service":"vantage"}
```

## Goal
AI-powered audit layer that detects mule accounts and synthetic identities in Nigerian fintech using graph network analysis. Middleware sidecar integrating with Squad API.

## Architecture

```
Squad API ←→ Vantage (Ktor :8080) ←→ Memgraph (Bolt :7687)
                 ↕ (SSE + REST)
            React Client
```

## Tech Stack
- **Server**: Kotlin 2.3.20 + Ktor 3.4.0 (Netty)
- **Graph DB**: Memgraph (Docker, Bolt :7687, image: memgraph/memgraph-mage:latest)
- **AI Agent**: Koog 0.7.1 — 3-tier fallback: Ollama → Gemini → Template
- **Serialization**: kotlinx-serialization-json 1.7.3
- **GeoIP**: ip-api.com (free HTTP API)
- **Auth**: Pre-shared API key (`Authorization: Bearer`) + JWT for admin sessions

## Auth

Two-tier authentication:

| Tier | Credential | Used By |
|------|-----------|---------|
| Server-to-server | `Authorization: Bearer <api-key>` | Squad → Vantage, scripts |
| Admin session | `Authorization: Bearer <jwt>` | React client → Vantage |

`POST /api/v1/admin/login` is unauthenticated — accepts `{ email, password }` and returns a JWT.
All other `/api/v1/*` routes accept **either** the API key **or** a valid JWT.
Webhook route (`/squad/webhook`) uses HMAC-SHA512 verification.

## Data Model

### Account node
```
(:Account {
  id: String, email: String?, bvn: String?, nin: String?,
  deviceFingerprint: String?, ipAddress: String?,
  geoCity: String?, geoCountry: String?,
  trustScore: Float DEFAULT 0.5, isBlacklisted: Boolean DEFAULT false,
  createdAt: DateTime
})
```

### Counterparty node
```
(:Counterparty {
  id: String, name: String?, type: String (MERCHANT|INDIVIDUAL|BILLER|VIRTUAL_ACCOUNT),
  category: String?, isBlacklisted: Boolean DEFAULT false, createdAt: DateTime
})
```

### Transaction edge
```
(:Account)-[:TRANSACTED_WITH {
  amount: Float, currency: String, timestamp: DateTime,
  transactionRef: String, sessionId: String?,
  riskFlag: String?
}]->(:Counterparty)
```

### Indices
```
CREATE INDEX ON :Account(id)
CREATE INDEX ON :Account(email)
CREATE INDEX ON :Counterparty(id)
```

## Trust Score
```
Ts = 0.35(Cpr) + 0.40(Vvel) - 0.25(Pdist)
```

- **Cpr (PageRank)**: `CALL page_rank.get(...)` — normalized [0,1]
- **Vvel (Velocity)**: 4-window weighted (1min×30, 5min×20, 1hr×10, 24hr×5) → clamped [0,1]
- **Pdist (Proximity)**: `shortestPath` to blacklisted counterparty → `1/(1+dist)`, 0 if none

### Tiers
| Range | Tier | Action |
|-------|------|--------|
| > 0.7 | GREEN | Pass |
| 0.4–0.7 | AMBER | Flag for review |
| < 0.4 | RED | Block, trigger alert |

## API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/v1/ingest/account | API key / JWT | Create/update account node |
| POST | /api/v1/ingest/transaction | API key / JWT | Record TRANSACTED_WITH edge |
| GET | /api/v1/trust/{accountId} | API key / JWT | Trust score + Koog explanation |
| POST | /api/v1/audit/proof-of-life | API key / JWT | Full audit: Squad verify + Ts + verdict |
| GET | /api/v1/status/{transactionRef} | API key / JWT | Cross-reference Squad + Vantage |
| POST | /squad/webhook | HMAC | Ingest real-time transaction from Squad |
| POST | /api/v1/admin/login | None | Admin login, returns JWT |
| POST | /api/v1/admin/flag/{id} | API key / JWT | Blacklist account |
| POST | /api/v1/admin/unflag/{id} | API key / JWT | Remove blacklist |
| GET | /api/v1/admin/flagged | API key / JWT | List flagged accounts |
| POST | /api/v1/admin/import/accounts | API key / JWT | Batch import accounts |
| GET | /api/v1/graph/network | API key / JWT | Subgraph JSON for UI |
| GET | /api/v1/events | API key / JWT | SSE stream |
| GET | /health | None | Health check |

## SSE Events

| Event | Payload | Trigger |
|-------|---------|---------|
| `transaction` | `{ accountId, merchantId, amount, tier }` | Webhook ingested |
| `alert` | `{ accountId, tier:"RED", ts, riskFactors }` | Ts drops below 0.4 |
| `flag_update` | `{ accountId, isBlacklisted, reason }` | Admin flag/unflag |

Heartbeat every 30s.

## AI Fallback Chain
1. Ollama (local, model via config)
2. Gemini (remote, API key via config)
3. Template (rule-based, no dependency)

## Memgraph Connection
- Bolt: `bolt://localhost:7687`
- Auth: `AuthTokens.basic("", "")` (empty credentials work with default memgraph-mage config)

## Build
```bash
cd server && ./gradlew build
```
Runs on JVM 21, Ktor Netty engine on port 8080.

## Recipes

## Admin Session Auth

- **Login**: `POST /api/v1/admin/login` — accepts `{ email, password }`, returns `{ token, expiresIn }`
- **Validation**: Password compared against env var `ADMIN_PASSWORD_HASH` (SHA-256 hex)
- **JWT**: HMAC-SHA256 signed, payload `{ sub, email, iat, exp }`, secret from env `JWT_SECRET`
- **TTL**: 24 hours (`expiresIn: 86400`)
- **Auth interceptor**: accepts `Authorization: Bearer <api-key>` **or** `Authorization: Bearer <jwt>`

Config via env (no defaults — startup fails if admin auth is misconfigured):

```bash
ADMIN_EMAIL=admin@vantage.com
ADMIN_PASSWORD_HASH=<sha256-hex>
JWT_SECRET=vantage-jwt-secret-2026
```

## Execution Plan

### Day 1 — Foundation
- [x] deps in `build.gradle.kts`
- [x] `docker-compose.yml` (Memgraph)
- [x] `.env.example`
- [x] `AppConfig.kt`
- [x] `MemgraphClient.kt` (Bolt connection pool)
- [x] `SchemaSetup.kt` + `Queries.kt`
- [x] Data models (Account, Counterparty, Transaction, TrustScore, SquadModels)
- [x] `Serialization.kt`
- [x] `StatusPages.kt`
- [x] `/health` endpoint

### Day 2 — Graph & Ingestion
- [x] `POST /api/v1/ingest/account` (with GeoIP enrichment)
- [x] `POST /api/v1/ingest/transaction`
- [x] `POST /api/v1/admin/import/accounts`
- [x] `GET /api/v1/graph/network`
- [x] Auth interceptor (API key)
- [x] SSE service (`SseService.kt`)
- [x] Squad API client (`SquadClient.kt`)
- [x] Trust score service (`TrustService.kt`)
- [x] AI service (`AiService.kt`)

### Day 3 — Trust Score Engine
- [x] PageRank scoring (`page_rank.get()`)
- [x] Velocity scoring (4-window weighted)
- [x] Proximity scoring (`shortestPath` to blacklisted)
- [x] Trust score formula: `Ts = 0.35(Cpr) + 0.40(Vvel) - 0.25(Pdist)`
- [x] `GET /api/v1/trust/{accountId}`
- [ ] Auto-recalc Ts on `POST /api/v1/ingest/transaction` *(only webhook triggers recalc)*
- [ ] Unit tests for trust components (PageRankEngineTest, VelocityIndexTest, etc.)

### Day 4 — Squad, SSE, Koog & Audit
- [x] Squad API client (`SquadClient.kt`)
- [x] `POST /api/v1/audit/proof-of-life`
- [x] `POST /squad/webhook`
- [x] `GET /api/v1/status/{transactionRef}`
- [x] Koog AI agent (3-tier fallback: Ollama → Gemini → Template)
- [x] SSE infrastructure (SharedFlow + SSE route)
- [x] Admin flag/unflag/flagged routes
- [ ] HMAC-SHA512 verification on `/squad/webhook` *(utility exists but not wired)*
- [ ] `flag_update` SSE event on flag/unflag
- [ ] Integration tests

### Day 5 — Admin Auth
- [x] `POST /api/v1/admin/login`
- [x] JWT creation/verification (HMAC-SHA256)
- [x] Auth interceptor accepts API key **or** JWT
- [x] Env vars: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`

### Remaining work
- [ ] React client (empty `client/` directory)
- [ ] Clean up unused `koog-agents` dependency (code uses raw HTTP instead)

### Docker up
```bash
docker compose up -d
```

### Seed test data (curl)
```bash
# Create account
curl -X POST http://localhost:8080/api/v1/ingest/account \
  -H "Authorization: Bearer vantage-dev-key-2026" \
  -H "Content-Type: application/json" \
  -d '{"id":"acc_001","email":"test@vantage.com"}'

# Create counterparty
# via Cypher console or ingest route

# Record transaction
curl -X POST http://localhost:8080/api/v1/ingest/transaction \
  -H "Authorization: Bearer vantage-dev-key-2026" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"acc_001","counterpartyId":"merch_001","amount":5000,"transactionRef":"txn_001"}'
```
