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
                    checkLargeTransactions()
                } catch (e: Exception) {
                    println("[NetworkAlertWorker] Error in alert worker: ${e.message}")
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
            
            // Refined: Use degree as well if possible, or just rank
            if (rank > 0.85) { 
                triggerAlert(id, "Critical Network Centrality", "Account $id has a network rank of ${"%.2f".format(rank)}. Potential fraud hub or high-risk node identified.", "critical")
            } else if (rank > 0.6) {
                triggerAlert(id, "Large Network Identification", "Account $id is connected to a large volume of counterparties. Recommend closer monitoring.", "warning")
            }
        }
    }

    private suspend fun checkLargeTransactions() {
        val results = memgraph.query(Queries.globalRecentTransactions())
        results.forEach { row ->
            val amount = (row["amount"] as? Number)?.toDouble() ?: 0.0
            val accountId = row["accountId"] as? String ?: return@forEach
            
            if (amount > 1000000.0) { // Large amount involvement
                triggerAlert(accountId, "Large Amount Involvement", "Account $accountId involved in a transaction of ${"%.2f".format(amount)}. High-value transaction alert.", "warning")
            }
        }
    }

    private fun triggerAlert(accountId: String, title: String, description: String, severity: String) {
        sseService.emitAlert(
            severity = severity,
            title = title,
            description = description,
            accountId = accountId
        )
    }

    fun stop() {
        scope.cancel()
        executor.shutdown()
    }
}
