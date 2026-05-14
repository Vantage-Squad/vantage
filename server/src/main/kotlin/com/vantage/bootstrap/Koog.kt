package com.vantage.bootstrap

import ai.koog.ktor.Koog
import ai.koog.prompt.llm.LLMProvider
import ai.koog.prompt.llm.LLModel
import com.vantage.AppContext
import io.ktor.server.application.*

fun Application.configureKoog() {
    val config = AppContext.config
    
    install(Koog) {
        llm {
            // Primary: Groq (OpenAI-compatible, 14,400 RPD free tier)
            if (config.llmGroqApiKey.isNotBlank()) {
                openAI(apiKey = config.llmGroqApiKey) {
                    baseUrl = "https://api.groq.com/openai/v1"
                }
                println("[Koog] Groq configured as primary LLM via OpenAI-compatible client (model: ${config.llmGroqModel})")
            }
            // Secondary: Gemini (Google AI Studio)
            else if (config.llmGeminiApiKey.isNotBlank()) {
                google(apiKey = config.llmGeminiApiKey)
                println("[Koog] Gemini configured as primary LLM")
            }
            
            // Fallback: Ollama (local inference)
            ollama {
                baseUrl = config.llmOllamaBaseUrl
            }
            
            fallback {
                provider = LLMProvider.Ollama
                model = LLModel(LLMProvider.Ollama, "llama3", emptyList(), null, null)
            }
        }
    }
}
