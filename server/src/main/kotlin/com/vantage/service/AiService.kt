package com.vantage.service

import com.vantage.AppContext
import com.vantage.model.Tier
import com.vantage.model.TrustScore
import com.vantage.model.VerdictExplanation
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

class AiService {
    private val config = AppContext.config
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun explain(ts: TrustScore): VerdictExplanation {
        return when (config.llmProvider) {
            "ollama" -> ollamaExplain(ts) ?: geminiExplain(ts) ?: templateExplain(ts)
            "gemini" -> geminiExplain(ts) ?: templateExplain(ts)
            else -> templateExplain(ts)
        }
    }

    private suspend fun ollamaExplain(ts: TrustScore): VerdictExplanation? {
        return try {
            val prompt = buildPrompt(ts)
            val client = HttpClient()
            val response: HttpResponse = client.post("${config.llmOllamaBaseUrl}/api/generate") {
                contentType(ContentType.Application.Json)
                setBody(mapOf("model" to config.llmOllamaModel, "prompt" to prompt, "stream" to false))
            }
            val body = response.bodyAsText()
            val parsed = json.decodeFromString<OllamaResponse>(body)
            parseExplanation(parsed.response)
        } catch (_: Exception) {
            null
        }
    }

    private suspend fun geminiExplain(ts: TrustScore): VerdictExplanation? {
        if (config.llmGeminiApiKey.isBlank()) return null
        return try {
            val prompt = buildPrompt(ts)
            val client = HttpClient()
            val payload = GeminiPayload(
                contents = listOf(GeminiContent(listOf(GeminiPart(prompt))))
            )
            val response: HttpResponse = client.post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${config.llmGeminiApiKey}"
            ) {
                contentType(ContentType.Application.Json)
                setBody(payload)
            }
            val body = response.bodyAsText()
            val parsed = json.decodeFromString<GeminiResponse>(body)
            val text = parsed.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text ?: return null
            parseExplanation(text)
        } catch (_: Exception) {
            null
        }
    }

    private fun templateExplain(ts: TrustScore): VerdictExplanation {
        val riskFactors = mutableListOf<String>()
        if (ts.cpr < 0.3) riskFactors.add("Low PageRank centrality — account may be isolated")
        if (ts.vvel > 0.6) riskFactors.add("High transaction velocity — possible mule behavior")
        if (ts.pdist > 0.3) riskFactors.add("Close proximity to blacklisted counterparty")
        if (ts.ts < 0.4) riskFactors.add("Overall trust score critically low")

        val verdict = when (ts.tier) {
            Tier.GREEN -> "PASS"
            Tier.AMBER -> "FLAG"
            Tier.RED -> "BLOCK"
        }
        val action = when (ts.tier) {
            Tier.GREEN -> "Allow transaction"
            Tier.AMBER -> "Flag for manual review"
            Tier.RED -> "Block transaction and trigger alert"
        }
        val summary = "Trust score ${ts.ts} (${ts.tier}). Risk factors: ${if (riskFactors.isEmpty()) "none detected" else riskFactors.joinToString("; ")}."

        return VerdictExplanation(verdict, summary, riskFactors, action)
    }

    private fun buildPrompt(ts: TrustScore): String = """
        You are Vantage, an AI fraud detection assistant for Nigerian fintech.
        Analyze this account's trust profile and provide a verdict.
        Trust Score: ${ts.ts}
        Tier: ${ts.tier}
        PageRank (CPR): ${ts.cpr}
        Velocity (VVEL): ${ts.vvel}
        Proximity to blacklisted (PDIST): ${ts.pdist}
        Provide: verdict (PASS/FLAG/BLOCK), summary, risk factors, recommended action.
    """.trimIndent()

    private fun parseExplanation(text: String): VerdictExplanation {
        val verdict = when {
            text.contains("BLOCK", ignoreCase = true) -> "BLOCK"
            text.contains("FLAG", ignoreCase = true) -> "FLAG"
            else -> "PASS"
        }
        val summary = text.take(200)
        return VerdictExplanation(verdict, summary)
    }
}

@Serializable
data class OllamaResponse(val response: String)

@Serializable
data class GeminiPayload(val contents: List<GeminiContent>)

@Serializable
data class GeminiResponse(val candidates: List<GeminiCandidate>? = null)

@Serializable
data class GeminiCandidate(val content: GeminiContent? = null)

@Serializable
data class GeminiContent(val parts: List<GeminiPart>)

@Serializable
data class GeminiPart(val text: String)
