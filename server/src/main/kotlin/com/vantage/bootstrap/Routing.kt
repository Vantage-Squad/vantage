package com.vantage.bootstrap

import com.vantage.AppContext
import com.vantage.auth.handleLogin
import com.vantage.auth.verifyHmacSignature
import com.vantage.service.TrustService
import com.vantage.model.Tier
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sse.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.add

fun Application.configureRouting() {
    install(SSE)
    routing {
        route("/api/v1") {
            post("/admin/login") {
                handleLogin(call)
            }
            configureApiRoutes()
        }
        post("/squad/webhook") {
            val json = Json { encodeDefaults = true; ignoreUnknownKeys = true }
            val trustService = TrustService()
            val bodyText = call.receive<String>()
            val signature = call.request.header("X-Squad-Encrypted-Body")
            if (signature != null) {
                val secret = AppContext.config.squadSecretKey
                if (!verifyHmacSignature(bodyText.toByteArray(), signature, secret)) {
                    call.respond(HttpStatusCode.Unauthorized, buildJsonObject { put("error", "Invalid HMAC signature") })
                    return@post
                }
            }
            val body = json.decodeFromString<Map<String, String>>(bodyText)
            val transactionRef = body["TransactionRef"] ?: body["transactionRef"] ?: run {
                call.respond(HttpStatusCode.BadRequest, buildJsonObject { put("error", "TransactionRef required") })
                return@post
            }
            val amount = body["amount"]?.toDoubleOrNull() ?: 0.0
            val accountId = body["email"] ?: "unknown"
            val ts = trustService.compute(accountId)
            
            val eventData = buildJsonObject {
                put("accountId", accountId)
                put("amount", amount)
                put("tier", ts.tier.name)
            }.toString()
            
            AppContext.sseService.emit("transaction", eventData)
            
            if (ts.tier == Tier.RED) {
                val alertData = buildJsonObject {
                    put("accountId", accountId)
                    put("tier", "RED")
                    put("ts", ts.ts)
                    putJsonArray("riskFactors") {
                        add("Trust score below 0.4 threshold")
                    }
                }.toString()
                AppContext.sseService.emit("alert", alertData)
            }
            
            call.respond(buildJsonObject {
                put("status", "processed")
                put("tier", ts.tier.name)
            })
        }
        get("/health") {
            call.respondText("""{"status":"ok","service":"vantage"}""", ContentType.Application.Json)
        }
    }
}
