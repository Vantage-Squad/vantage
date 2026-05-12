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
            if (config.llmGeminiApiKey.isNotBlank()) {
                google(apiKey = config.llmGeminiApiKey)
            }
            
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
