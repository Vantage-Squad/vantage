package com.vantage.db

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.neo4j.driver.*
import org.neo4j.driver.SessionConfig

class MemgraphClient(
    private val boltUri: String,
    private val username: String = "",
    private val password: String = ""
) : AutoCloseable {

    private val driver: Driver = if (username.isBlank()) {
        GraphDatabase.driver(boltUri, AuthTokens.none())
    } else {
        GraphDatabase.driver(boltUri, AuthTokens.basic(username, password))
    }

    suspend fun query(cypher: String, params: Map<String, Any?> = emptyMap()): List<Map<String, Any>> =
        withContext(Dispatchers.IO) {
            driver.session(SessionConfig.defaultConfig()).use { session ->
                session.run(cypher, params).list().map { record ->
                    record.keys().associateWith { key ->
                        record.get(key).asObject()
                    }
                }
            }
        }

    suspend fun execute(cypher: String, params: Map<String, Any?> = emptyMap()) =
        withContext(Dispatchers.IO) {
            driver.session(SessionConfig.defaultConfig()).use { session ->
                session.run(cypher, params).consume()
            }
        }

    suspend fun readSingle(cypher: String, params: Map<String, Any?> = emptyMap()): Map<String, Any>? =
        withContext(Dispatchers.IO) {
            driver.session(SessionConfig.defaultConfig()).use { session ->
                val results = session.run(cypher, params).list()
                if (results.isEmpty()) null
                else results.first().keys().associateWith { key ->
                    results.first().get(key).asObject()
                }
            }
        }

    fun isConnected(): Boolean = try {
        driver.verifyConnectivity()
        true
    } catch (_: Exception) {
        false
    }

    override fun close() {
        driver.close()
    }
}
