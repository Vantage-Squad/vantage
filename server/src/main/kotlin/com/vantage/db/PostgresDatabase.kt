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

            val sslParams = "ssl=true&sslmode=require&sslfactory=org.postgresql.ssl.NonValidatingFactory"
            val timeoutParams = "connectTimeout=30&socketTimeout=30&loginTimeout=30&tcpKeepAlive=true"
            jdbcUrl = if (rawUrl.contains("?")) "$rawUrl&$sslParams&$timeoutParams" else "$rawUrl?$sslParams&$timeoutParams"
            username = finalUser
            password = finalPass
            driverClassName = "org.postgresql.Driver"
            maximumPoolSize = 10
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            validate()
        }
        
        println("[Postgres] Attempting connection to: ${hikariConfig.jdbcUrl.split("?")[0]}")
        dataSource = HikariDataSource(hikariConfig)
        Database.connect(dataSource!!)

        // Run migrations
        println("[Postgres] Running Flyway migrations...")
        try {
            val flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load()
            val result = flyway.migrate()
            println("[Postgres] Flyway migration successful: ${result.migrationsExecuted} migrations executed.")
        } catch (e: Exception) {
            println("[Postgres] Flyway migration failed: ${e.message}")
            e.printStackTrace()
            // Optional: Fallback to Exposed SchemaUtils if Flyway fails in this environment
        }
        
        println("[Postgres] Database initialization complete.")
        
        // Final fallback: Ensure tables exist using Exposed SchemaUtils
        // This acts as a safety net if Flyway migrations didn't run for some reason
        org.jetbrains.exposed.sql.transactions.transaction {
            org.jetbrains.exposed.sql.SchemaUtils.createMissingTablesAndColumns(
                UsersTable,
                TransactionHistoryTable,
                AccountStatesTable
            )
        }
    }

    suspend fun <T> dbQuery(block: suspend () -> T): T =
        newSuspendedTransaction(Dispatchers.IO) { block() }

    fun close() {
        dataSource?.close()
    }
}
