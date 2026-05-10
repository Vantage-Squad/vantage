package com.vantage.service

import io.ktor.server.sse.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class SseEvent(
    val event: String,
    val data: String
)

class SseService {
    private val json = Json { encodeDefaults = true }
    private val _events = MutableSharedFlow<SseEvent>(extraBufferCapacity = 64)
    val events: SharedFlow<SseEvent> = _events.asSharedFlow()

    suspend fun emit(event: String, data: String) {
        _events.emit(SseEvent(event, data))
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
