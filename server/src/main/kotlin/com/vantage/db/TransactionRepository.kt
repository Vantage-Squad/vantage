package com.vantage.db

import com.vantage.model.TrustScore
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.update
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import java.util.UUID
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.encodeToJsonElement
import java.time.OffsetDateTime

object TransactionRepository {

    suspend fun saveHistory(
        trustScore: TrustScore,
        agentSummary: String?,
        verdict: String?
    ) = PostgresDatabase.dbQuery {
        TransactionHistoryTable.insert {
            it[this.id] = UUID.randomUUID()
            it[this.accountId] = trustScore.accountId
            it[this.amount] = 0.0.toBigDecimal() 
            it[this.status] = trustScore.tier.name
            it[this.trustScore] = trustScore.ts
            it[this.agentSummary] = agentSummary
            it[this.metadata] = Json.encodeToJsonElement(mapOf(
                "cpr" to trustScore.cpr,
                "vvel" to trustScore.vvel,
                "pdist" to trustScore.pdist,
                "verdict" to verdict
            ))
        }
        
        // Upsert account state
        val updated = AccountStatesTable.update({ AccountStatesTable.accountId eq trustScore.accountId }) {
            it[this.lastSeen] = OffsetDateTime.now().toInstant()
        }
        if (updated == 0) {
            AccountStatesTable.insert {
                it[this.accountId] = trustScore.accountId
                it[this.lastSeen] = OffsetDateTime.now().toInstant()
            }
        }
    }

    suspend fun getFalsePositiveCount(accountId: String): Int = PostgresDatabase.dbQuery {
        TransactionHistoryTable.select { 
            (TransactionHistoryTable.accountId eq accountId) and (TransactionHistoryTable.isFalsePositive eq true) 
        }.count().toInt()
    }
}
