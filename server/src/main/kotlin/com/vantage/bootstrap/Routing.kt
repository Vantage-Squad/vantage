package com.vantage.bootstrap

import com.vantage.AppContext
import com.vantage.service.TrustService
import com.vantage.model.Tier
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sse.*
import kotlinx.serialization.json.Json

fun Application.configureRouting() {
    install(SSE)
    routing {
        route("/api/v1") {
            configureApiRoutes()
        }
        post("/squad/webhook") {
            val json = Json { encodeDefaults = true; ignoreUnknownKeys = true }
            val trustService = TrustService()
            val body = call.receive<Map<String, String>>()
            val transactionRef = body["TransactionRef"] ?: body["transactionRef"] ?: run {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "TransactionRef required"))
                return@post
            }
            val amount = body["amount"]?.toDoubleOrNull() ?: 0.0
            val accountId = body["email"] ?: "unknown"
            val ts = trustService.compute(accountId)
            val eventData = json.encodeToString(mapOf(
                "accountId" to accountId, "amount" to amount, "tier" to ts.tier.name
            ))
            AppContext.sseService.emit("transaction", eventData)
            if (ts.tier == Tier.RED) {
                val alertData = json.encodeToString(mapOf(
                    "accountId" to accountId, "tier" to "RED",
                    "ts" to ts.ts, "riskFactors" to listOf("Trust score below 0.4 threshold")
                ))
                AppContext.sseService.emit("alert", alertData)
            }
            call.respond(mapOf("status" to "processed", "tier" to ts.tier.name))
        }
        get("/health") {
            call.respondText("""{"status":"ok","service":"vantage"}""", ContentType.Application.Json)
        }
    }
}
