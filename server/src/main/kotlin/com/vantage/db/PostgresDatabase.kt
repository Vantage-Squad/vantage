package com.vantage.db

import com.vantage.config.AppConfig
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.flywaydb.core.Flyway
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import kotlinx.coroutines.Dispatchers

object PostgresDatabase {
    private var dataSource: HikariDataSource? = null

    fun init(config: AppConfig) {
        val hikariConfig = HikariConfig().apply {
            var rawUrl = config.postgresUrl
            var finalUser = config.postgresUser
            var finalPass = config.postgresPassword

            // Handle postgres:// or postgresql:// with potential user:pass@host
            val cleanedUrl = rawUrl.removePrefix("jdbc:").removePrefix("postgresql://").removePrefix("postgres://")
            if (cleanedUrl.contains("@")) {
                val authAndHost = cleanedUrl.split("@")
                val auth = authAndHost[0]
                val hostAndDb = authAndHost[1]
                
                if (auth.contains(":")) {
                    val userPass = auth.split(":")
                    finalUser = userPass[0]
                    finalPass = userPass[1]
                } else {
                    finalUser = auth
                }
                rawUrl = "jdbc:postgresql://$hostAndDb"
            } else {
                rawUrl = when {
                    rawUrl.startsWith("jdbc:postgresql://") -> rawUrl
                    rawUrl.startsWith("postgresql://") -> "jdbc:$rawUrl"
                    rawUrl.startsWith("postgres://") -> "jdbc:postgresql://" + rawUrl.removePrefix("postgres://")
                    else -> rawUrl
                }
            }

            jdbcUrl = rawUrl
            username = finalUser
            password = finalPass
            driverClassName = "org.postgresql.Driver"
            maximumPoolSize = 10
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            validate()
        }
        
        dataSource = HikariDataSource(hikariConfig)
        Database.connect(dataSource!!)

        // Run migrations
        val flyway = Flyway.configure()
            .dataSource(dataSource)
            .load()
        flyway.migrate()
        
        println("[Postgres] Database initialized and migrations applied.")
    }

    suspend fun <T> dbQuery(block: suspend () -> T): T =
        newSuspendedTransaction(Dispatchers.IO) { block() }

    fun close() {
        dataSource?.close()
    }
}
