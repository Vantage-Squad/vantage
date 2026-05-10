package com.vantage.db

class SchemaSetup(private val client: MemgraphClient) {

    suspend fun run() {
        val queries = listOf(
            "CREATE INDEX ON :Account(id);",
            "CREATE INDEX ON :Account(email);",
            "CREATE INDEX ON :Counterparty(id);",
            "CREATE INDEX ON :AdminUser(email);"
        )
        for (q in queries) {
            try {
                client.execute(q)
                println("[Schema] Executed: $q")
            } catch (e: Exception) {
                println("[Schema] Skipped (already exists?): ${e.message}")
            }
        }
        seedAdmin()
        println("[Schema] Schema setup complete.")
    }

    private suspend fun seedAdmin() {
        val adminEmail = System.getenv("ADMIN_EMAIL") ?: return
        val adminPasswordHash = System.getenv("ADMIN_PASSWORD_HASH") ?: return
        val count = client.readSingle(Queries.countAdminUsers())
        val exists = (count?.get("count") as? Number)?.toInt() ?: 0
        if (exists == 0) {
            client.execute(Queries.createAdminUser(), mapOf(
                "id" to adminEmail,
                "email" to adminEmail,
                "passwordHash" to adminPasswordHash
            ))
            println("[Schema] Seeded first admin user: $adminEmail")
        }
    }
}
