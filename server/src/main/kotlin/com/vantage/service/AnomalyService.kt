package com.vantage.service

import com.vantage.AppContext
import com.vantage.db.PostgresDatabase
import com.vantage.db.TransactionHistoryTable
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.and
import java.math.BigDecimal
import kotlin.math.sqrt

object AnomalyService {

    private val config = AppContext.config

    suspend fun isAmountAnomaly(accountId: String, amount: Double): AnomalyResult = PostgresDatabase.dbQuery {
        // Fetch last 50 transactions for this account from Postgres history
        val history = TransactionHistoryTable.selectAll().where { TransactionHistoryTable.accountId eq accountId }
            .orderBy(TransactionHistoryTable.createdAt to SortOrder.DESC)
            .limit(50)
            .map { it[TransactionHistoryTable.amount].toDouble() }

        if (history.size < 5) return@dbQuery AnomalyResult(false, 0.0)

        val mean = history.average()
        val stdDev = sqrt(history.map { Math.pow(it - mean, 2.0) }.average())

        if (stdDev == 0.0) return@dbQuery AnomalyResult(false, 0.0)

        val zScore = (amount - mean) / stdDev
        val isAnomaly = zScore > 3.0 // Z-score threshold

        AnomalyResult(isAnomaly, zScore)
    }
}

data class AnomalyResult(val isAnomaly: Boolean, val zScore: Double)
