package com.vantage.config

import io.github.cdimascio.dotenv.dotenv
import io.ktor.server.config.ApplicationConfig

class AppConfig(config: ApplicationConfig) {

    private val dotenv = dotenv {
        ignoreIfMissing = true
    }

    val apiKey: String = env("VANTAGE_API_KEY") ?: prop(config, "app.apiKey") ?: "vantage-dev-key-2026"

    val squadSandboxBaseUrl: String = env("SQUAD_SANDBOX_BASE_URL") ?: "https://sandbox-api-d.squadco.com"
    val squadSecretKey: String = env("SQUAD_SECRET_KEY") ?: ""
    val squadPublicKey: String = env("SQUAD_PUBLIC_KEY") ?: ""

    val memgraphBoltUri: String = env("NEO4J_BOLT_URI") ?: env("MEMGRAPH_BOLT_URI") ?: prop(config, "app.memgraph.boltUri") ?: "bolt://localhost:7687"
    val memgraphUsername: String = env("NEO4J_USERNAME") ?: env("MEMGRAPH_USERNAME") ?: prop(config, "app.memgraph.username") ?: ""
    val memgraphPassword: String = env("NEO4J_PASSWORD") ?: env("MEMGRAPH_PASSWORD") ?: prop(config, "app.memgraph.password") ?: ""

    val postgresUrl: String = env("POSTGRES_URL") ?: prop(config, "app.database.url") ?: "jdbc:postgresql://localhost:5432/vantage"
    val postgresUser: String = env("POSTGRES_USER") ?: prop(config, "app.database.user") ?: "postgres"
    val postgresPassword: String = env("POSTGRES_PASSWORD") ?: prop(config, "app.database.password") ?: "password"

    // Trust Score Weights & Thresholds
    val trustScoreAlpha: Double = env("TRUST_SCORE_ALPHA")?.toDoubleOrNull() ?: 0.35
    val trustScoreBeta: Double = env("TRUST_SCORE_BETA")?.toDoubleOrNull() ?: 0.40
    val trustScoreGamma: Double = env("TRUST_SCORE_GAMMA")?.toDoubleOrNull() ?: 0.25
    val trustScoreSafeThreshold: Double = env("TRUST_SCORE_SAFE_THRESHOLD")?.toDoubleOrNull() ?: 0.7
    val trustScoreHighRiskThreshold: Double = env("TRUST_SCORE_HIGH_RISK_THRESHOLD")?.toDoubleOrNull() ?: 0.4

    // LLM Config
    val llmProvider: String = env("LLM_PROVIDER") ?: "template"
    val llmOllamaModel: String = env("OLLAMA_MODEL") ?: "llama3.1:8b"
    val llmOllamaBaseUrl: String = env("OLLAMA_BASE_URL") ?: "http://localhost:11434"
    val llmGeminiApiKey: String = env("GEMINI_API_KEY") ?: ""
    val llmGroqApiKey: String = env("GROQ_API_KEY") ?: ""
    val llmGroqModel: String = env("GROQ_MODEL") ?: "llama-3.3-70b-versatile"
    val llmGroqBaseUrl: String = env("GROQ_BASE_URL") ?: "https://api.groq.com/openai/v1"
    val llmSystemPrompt: String = env("LLM_SYSTEM_PROMPT") ?: "You are Vantage, a professional fraud detection assistant for fintech security operations. Provide clear, concise, and technical risk summaries."

    // Enrichment
    val geoIpApiUrl: String = env("GEOIP_API_URL") ?: "http://ip-api.com/json/"

    // Admin Config
    val adminEmail: String? = env("ADMIN_EMAIL")
    val adminPassword: String? = env("ADMIN_PASSWORD")
    val adminPasswordHash: String? = env("ADMIN_PASSWORD_HASH")

    val jwtSecret: String = env("JWT_SECRET") ?: "vantage-jwt-secret-2026"

    private fun env(key: String): String? {
        val dotenvVal = try { dotenv[key] } catch (_: Exception) { null }
        if (!dotenvVal.isNullOrBlank()) return dotenvVal
        val value = System.getenv(key)
        if (!value.isNullOrBlank()) return value
        val prop = System.getProperty(key)
        if (!prop.isNullOrBlank()) return prop
        return null
    }

    private fun prop(config: ApplicationConfig, key: String): String? = try {
        config.property(key).getString()
    } catch (_: Exception) { null }
}
