package com.vantage.service

import com.vantage.AppContext
import com.vantage.db.Queries
import com.vantage.model.Tier
import com.vantage.model.TrustScore
import com.vantage.model.TrustScoreComponents
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers

class TrustService {
    private val memgraph = AppContext.memgraph
    private val config = AppContext.config

    suspend fun compute(accountId: String): TrustScore {
        val cpr = computePageRank(accountId)
        val vvel = computeVelocity(accountId)
        val pdist = computeProximity(accountId)
        val ts = config.trustScoreAlpha * cpr + config.trustScoreBeta * vvel - config.trustScoreGamma * pdist
        val clamped = ts.coerceIn(0.0, 1.0)
        val tier = when {
            clamped > config.trustScoreSafeThreshold -> Tier.SAFE
            clamped >= config.trustScoreHighRiskThreshold -> Tier.HIGH_RISK
            else -> Tier.CRITICAL
        }
        memgraph.execute(Queries.updateTrustScore(), mapOf("id" to accountId, "ts" to clamped))
        val score = TrustScore(
            accountId = accountId,
            ts = clamped,
            tier = tier,
            cpr = cpr,
            vvel = vvel,
            pdist = pdist
        )

        // Persist history asynchronously
        kotlinx.coroutines.GlobalScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            try {
                com.vantage.db.TransactionRepository.saveHistory(score, null, null)
            } catch (e: Exception) {
                println("[TrustService] Failed to save history: ${e.message}")
            }
        }

        return score
    }

    private suspend fun computePageRank(accountId: String): Double {
        return try {
            val results = memgraph.query(Queries.pageRank())
            val rankMap = results.associate { it["id"] to it["rank"] }
            val rank = rankMap[accountId]?.let { (it as? Number)?.toDouble() } ?: 0.0
            rank.coerceIn(0.0, 1.0)
        } catch (_: Exception) {
            0.0
        }
    }

    private suspend fun computeVelocity(accountId: String): Double {
        val windows = listOf(
            "PT1M" to 30,
            "PT5M" to 20,
            "PT1H" to 10,
            "PT24H" to 5
        )
        var weightedSum = 0.0
        var totalWeight = 0
        for ((window, weight) in windows) {
            val result = memgraph.readSingle(Queries.transactionCountInWindow(), mapOf("id" to accountId, "window" to window))
            val count = (result?.get("count") as? Number)?.toInt() ?: 0
            weightedSum += count * weight
            totalWeight += weight
        }
        val avg = if (totalWeight > 0) weightedSum / totalWeight else 0.0
        return (avg.coerceIn(0.0, 100.0) / 100.0).coerceAtMost(1.0)
    }

    private suspend fun computeProximity(accountId: String): Double {
        return try {
            val result = memgraph.readSingle(Queries.proximityToBlacklisted(), mapOf("id" to accountId))
            val dist = (result?.get("distance") as? Number)?.toInt() ?: return 0.0
            1.0 / (1.0 + dist)
        } catch (_: Exception) {
            0.0
        }
    }
}
