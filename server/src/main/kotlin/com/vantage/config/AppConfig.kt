package com.vantage.config

import io.ktor.server.config.ApplicationConfig

class AppConfig(config: ApplicationConfig) {

    val apiKey: String = env("VANTAGE_API_KEY") ?: prop(config, "app.apiKey") ?: "vantage-dev-key-2026"

    val squadSandboxBaseUrl: String = env("SQUAD_SANDBOX_BASE_URL") ?: "https://sandbox-api-d.squadco.com"
    val squadSecretKey: String = env("SQUAD_SECRET_KEY") ?: ""
    val squadPublicKey: String = env("SQUAD_PUBLIC_KEY") ?: ""

    val memgraphBoltUri: String = env("MEMGRAPH_BOLT_URI") ?: "bolt://localhost:7687"
    val memgraphUsername: String = env("MEMGRAPH_USERNAME") ?: ""
    val memgraphPassword: String = env("MEMGRAPH_PASSWORD") ?: ""

    val trustScoreAlpha: Double = 0.35
    val trustScoreBeta: Double = 0.40
    val trustScoreGamma: Double = 0.25
    val trustScoreGreenThreshold: Double = 0.7
    val trustScoreAmberThreshold: Double = 0.4

    val llmProvider: String = env("LLM_PROVIDER") ?: "template"
    val llmOllamaModel: String = env("OLLAMA_MODEL") ?: "llama3.1:8b"
    val llmOllamaBaseUrl: String = env("OLLAMA_BASE_URL") ?: "http://localhost:11434"
    val llmGeminiApiKey: String = env("GEMINI_API_KEY") ?: ""

    private fun env(key: String): String? {
        val value = System.getenv(key)
        return if (value.isNullOrBlank()) null else value
    }

    private fun prop(config: ApplicationConfig, key: String): String? = try {
        config.property(key).getString()
    } catch (_: Exception) { null }
}
