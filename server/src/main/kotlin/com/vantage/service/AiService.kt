package com.vantage.service

import ai.koog.agents.core.agent.AIAgent
import ai.koog.ktor.Koog
import ai.koog.prompt.llm.LLMProvider
import ai.koog.prompt.llm.LLModel
import com.vantage.AppContext
import com.vantage.model.Tier
import com.vantage.model.TrustScore
import com.vantage.model.VerdictExplanation
import io.ktor.server.application.*

class AiService {
    private val config = AppContext.config
    private val application = AppContext.application
    
    // Retrieve the Koog plugin instance
    private val koog = application.plugin(Koog)
    
    // Select model based on available provider: Groq > Ollama
    private val selectedModel: LLModel = if (config.llmGroqApiKey.isNotBlank()) {
        LLModel(LLMProvider.OpenAI, config.llmGroqModel, emptyList(), null, null)
    } else {
        LLModel(LLMProvider.Ollama, "llama3.1:8b", emptyList(), null, null)
    }
    
    // Build an agent using the shared executor and the best available model
    private val agent = AIAgent.builder()
        .promptExecutor(koog.promptExecutor)
        .llmModel(selectedModel)
        .systemPrompt("You are Vantage, a professional fraud detection assistant for fintech security operations. Provide clear, concise, and technical risk summaries.")
        .build()

    init {
        val providerName = if (config.llmGroqApiKey.isNotBlank()) "Groq (${config.llmGroqModel})" else "Ollama (llama3.1:8b)"
        println("[AiService] Using LLM provider: $providerName")
    }

    suspend fun explain(ts: TrustScore): VerdictExplanation {
        val promptText = buildPrompt(ts)
        
        return try {
            // Use the agent to run the prompt
            val responseText = agent.run(agentInput = promptText)
            parseExplanation(responseText)
        } catch (e: Exception) {
            println("[AiService] AI execution failed: ${e.message}")
            e.printStackTrace()
            // Tertiary fallback: Template
            templateExplain(ts)
        }
    }

    private fun templateExplain(ts: TrustScore): VerdictExplanation {
        val riskFactors = mutableListOf<String>()
        if (ts.cpr < 0.3) riskFactors.add("Low PageRank centrality — account may be isolated")
        if (ts.vvel > 0.6) riskFactors.add("High transaction velocity — possible mule behavior")
        if (ts.pdist > 0.3) riskFactors.add("Close proximity to blacklisted counterparty")

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
        System: Vantage Security Engine
        Action: Generate Risk Profile
        
        Metrics:
        - Trust Score: ${ts.ts} (Tier: ${ts.tier})
        - PageRank Centrality: ${ts.cpr}
        - Transaction Velocity: ${ts.vvel}
        - Blacklist Proximity: ${ts.pdist}
        
        Requirement: Provide a professional risk verdict (PASS, FLAG, or BLOCK), a concise technical summary of factors, and mitigation recommendations.
    """.trimIndent()

    private fun parseExplanation(text: String): VerdictExplanation {
        val verdict = when {
            text.contains("BLOCK", ignoreCase = true) -> "BLOCK"
            text.contains("FLAG", ignoreCase = true) -> "FLAG"
            else -> "PASS"
        }
        return VerdictExplanation(verdict, text)
    }
}
