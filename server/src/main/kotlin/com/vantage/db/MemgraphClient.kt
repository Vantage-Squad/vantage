package com.vantage.db

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.neo4j.driver.*

class MemgraphClient(
    private val boltUri: String,
    private val username: String = "",
    private val password: String = ""
) : AutoCloseable {

    private val driver: Driver = GraphDatabase.driver(
        boltUri,
        AuthTokens.basic(username, password)
    )

    suspend fun query(cypher: String, params: Map<String, Any?> = emptyMap()): List<Map<String, Any>> =
        withContext(Dispatchers.IO) {
            driver.session().use { session ->
                session.run(cypher, params).list().map { record ->
                    record.keys().associateWith { key ->
                        record.get(key).asObject()
                    }
                }
            }
        }

    suspend fun execute(cypher: String, params: Map<String, Any?> = emptyMap()) =
        withContext(Dispatchers.IO) {
            driver.session().use { session ->
                session.run(cypher, params).consume()
            }
        }

    suspend fun readSingle(cypher: String, params: Map<String, Any?> = emptyMap()): Map<String, Any>? =
        withContext(Dispatchers.IO) {
            driver.session().use { session ->
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
