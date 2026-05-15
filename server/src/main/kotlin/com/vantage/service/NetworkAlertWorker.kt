package com.vantage.service

import com.vantage.AppContext
import com.vantage.db.Queries
import kotlinx.coroutines.*
import java.util.concurrent.Executors

class NetworkAlertWorker(private val sseService: SseService) {
    private val memgraph = AppContext.memgraph
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val executor = Executors.newSingleThreadScheduledExecutor()

    fun start() {
        scope.launch {
            while (isActive) {
                try {
                    checkCentrality()
                } catch (e: Exception) {
                    println("[NetworkAlertWorker] Error checking centrality: ${e.message}")
                }
                delay(60000) // Check every minute
            }
        }
    }

    private suspend fun checkCentrality() {
        val results = memgraph.query(Queries.pageRank())
        results.forEach { row ->
            val id = row["id"] as? String ?: return@forEach
            val rank = (row["rank"] as? Number)?.toDouble() ?: 0.0
            
            if (rank > 0.8) { // Hardcoded for now, should move to config
                triggerAlert(id, rank)
            }
        }
    }

    private fun triggerAlert(accountId: String, rank: Double) {
        // Emit SSE alert
        sseService.emitAlert(
            severity = "critical",
            title = "High Network Centrality Detected",
            description = "Account $accountId has a network rank of ${"%.2f".format(rank)}. Potential fraud hub identified.",
            accountId = accountId
        )
    }

    fun stop() {
        scope.cancel()
        executor.shutdown()
    }
}
