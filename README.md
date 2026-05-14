# Vantage — AI-Powered Fraud Detection

Vantage is an AI-powered audit layer that detects mule accounts and synthetic identities in Nigerian fintech using graph network analysis. It integrates with the Squad API to provide real-time transaction monitoring and trust scoring.

## Key Features

- **Graph-Based Analysis**: Uses Memgraph to analyze transaction networks and detect suspicious clusters.
- **Trust Scoring Engine**: Multi-factor scoring using PageRank (centrality), transaction velocity, and proximity to known bad actors.
- **AI-Powered Explanations**: Integrates with Google Gemini (via Koog SDK) to provide natural language explanations for fraud verdicts.
- **Real-Time Monitoring**: SSE (Server-Sent Events) for real-time alerts and dashboard updates.
- **Squad Integration**: Ingests transactions via webhooks and performs "proof-of-life" audits.

## Tech Stack

- **Backend**: Kotlin, Ktor, Netty
- **Database**: Memgraph (Graph DB)
- **AI Agent**: [Koog](https://github.com/koog-ai/koog) (Gemini + Ollama)
- **Security**: JWT for admin sessions, API Keys, HMAC for webhooks

## Getting Started

### Prerequisites

- Docker Desktop (for Memgraph)
- Java 21 JDK
- Google Gemini API Key (optional, falls back to Ollama or Template)

### Setup

1. **Start Memgraph**:
   ```bash
   docker compose up -d
   ```

2. **Configure Environment**:
   Copy `server/.env.example` to `server/.env` and fill in your keys.

3. **Run the Server**:
   ```bash
   cd server
   ./gradlew run
   ```

4. **Health Check**:
   ```bash
   curl http://localhost:8080/health
   ```

## API Documentation

The full OpenAPI specification is available at `server/src/main/resources/documentation.yaml`.
When the server is running, you can access the Swagger UI at `http://localhost:8080/swagger`.

## License

MIT
