package com.vantage.service

import com.vantage.AppContext
import com.vantage.model.SquadVerificationResponse
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.json.Json

class SquadClient {
    private val client = HttpClient()
    private val json = Json { ignoreUnknownKeys = true }
    private val config = AppContext.config

    suspend fun verifyTransaction(transactionRef: String): SquadVerificationResponse? {
        return try {
            val response: HttpResponse = client.get("${config.squadSandboxBaseUrl}/transaction/verify/$transactionRef") {
                header("Authorization", "Bearer ${config.squadSecretKey}")
                header("Content-Type", "application/json")
            }
            if (response.status.value == 200) {
                response.body<SquadVerificationResponse>()
            } else null
        } catch (_: Exception) {
            null
        }
    }
}
