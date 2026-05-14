package com.vantage.db

import com.vantage.AppContext

class SchemaSetup(private val client: MemgraphClient) {

    suspend fun run() {
        val queries = listOf(
            "CREATE INDEX account_id IF NOT EXISTS FOR (a:Account) ON (a.id)",
            "CREATE INDEX account_email IF NOT EXISTS FOR (a:Account) ON (a.email)",
            "CREATE INDEX counterparty_id IF NOT EXISTS FOR (c:Counterparty) ON (c.id)",
            "CREATE INDEX admin_email IF NOT EXISTS FOR (u:AdminUser) ON (u.email)"
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
        val adminEmail = AppContext.config.adminEmail ?: return
        val adminPasswordHash = AppContext.config.adminPasswordHash ?: return
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
