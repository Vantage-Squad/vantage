package com.vantage.db

class SchemaSetup(private val client: MemgraphClient) {

    suspend fun run() {
        val queries = listOf(
            "CREATE INDEX ON :Account(id);",
            "CREATE INDEX ON :Account(email);",
            "CREATE INDEX ON :Counterparty(id);"
        )
        for (q in queries) {
            try {
                client.execute(q)
                println("[Schema] Executed: $q")
            } catch (e: Exception) {
                println("[Schema] Skipped (already exists?): ${e.message}")
            }
        }
        println("[Schema] Schema setup complete.")
    }
}
