package com.vantage.service

import com.vantage.AppContext
import com.vantage.db.Queries
import com.vantage.model.Tier
import com.vantage.model.TrustScore
import com.vantage.model.TrustScoreComponents

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
            clamped > config.trustScoreGreenThreshold -> Tier.GREEN
            clamped >= config.trustScoreAmberThreshold -> Tier.AMBER
            else -> Tier.RED
        }
        memgraph.execute(Queries.updateTrustScore(), mapOf("id" to accountId, "ts" to clamped))
        return TrustScore(
            accountId = accountId,
            ts = clamped,
            tier = tier,
            cpr = cpr,
            vvel = vvel,
            pdist = pdist
        )
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
            "P0Y0M0DT0H1M0S" to 30,
            "P0Y0M0DT0H5M0S" to 20,
            "P0Y0M0DT1H0M0S" to 10,
            "P0Y0M0DT24H0M0S" to 5
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
