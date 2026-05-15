package com.vantage.service

import io.ktor.server.sse.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.*
import com.vantage.db.MemgraphClient
import com.vantage.db.Queries

@Serializable
data class SseEvent(
    val event: String,
    val data: String
)

class SseService {
    private val json = Json { encodeDefaults = true }
    private val _events = MutableSharedFlow<SseEvent>(extraBufferCapacity = 64)
    val events: SharedFlow<SseEvent> = _events.asSharedFlow()
    private var lastSeenRef: String? = null

    suspend fun emit(event: String, data: String) {
        _events.emit(SseEvent(event, data))
    }

    fun start(scope: CoroutineScope, memgraph: MemgraphClient) {
        scope.launch {
            println("[SSE] Starting background event emitter...")
            while (isActive) {
                delay(1500)
                try {
                    val results = memgraph.query(Queries.globalRecentTransactions())
                    if (results.isEmpty()) continue

                    val latest = results.first()
                    val latestRef = latest["transactionRef"] as? String

                    if (latestRef != null && latestRef != lastSeenRef) {
                        val newEvents = mutableListOf<Map<String, Any?>>()
                        for (row in results) {
                            val ref = row["transactionRef"] as? String
                            if (ref == lastSeenRef) break
                            newEvents.add(row)
                        }

                        newEvents.reversed().forEach { event ->
                            val data = buildJsonObject {
                                put("accountId", event["accountId"] as? String ?: "")
                                put("amount", (event["amount"] as? Number)?.toDouble() ?: 0.0)
                                put("transactionRef", event["transactionRef"] as? String ?: "")
                                put("timestamp", event["timestamp"]?.toString() ?: "")
                                put("counterpartyId", event["counterpartyId"] as? String ?: "")
                            }.toString()
                            emit("transaction", data)
                        }
                        lastSeenRef = latestRef
                    }
                } catch (e: Exception) {
                    // Silently fail to avoid spamming logs, but maybe print once
                    // println("[SSE] Polling error: ${e.message}")
                }
            }
        }
    }

    suspend fun handleConnection(scope: CoroutineScope, sse: ServerSSESession) {
        val heartbeatJob = scope.launch {
            while (isActive) {
                delay(30_000)
                try {
                    sse.send(event = "heartbeat", data = "{}")
                } catch (_: Exception) { break }
            }
        }
        try {
            events.collect { sseEvent ->
                try {
                    sse.send(event = sseEvent.event, data = sseEvent.data)
                } catch (e: Exception) { throw e }
            }
        } finally {
            heartbeatJob.cancel()
        }
    }
}
