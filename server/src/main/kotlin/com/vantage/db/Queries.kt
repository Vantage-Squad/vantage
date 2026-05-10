package com.vantage.db

object Queries {

    fun createAccount() = """
        MERGE (a:Account {id: ${"$"}id})
        SET a.email = ${"$"}email, a.bvn = ${"$"}bvn, a.nin = ${"$"}nin,
            a.deviceFingerprint = ${"$"}deviceFingerprint, a.ipAddress = ${"$"}ipAddress,
            a.geoCity = ${"$"}geoCity, a.geoCountry = ${"$"}geoCountry,
            a.trustScore = COALESCE(a.trustScore, 0.5),
            a.isBlacklisted = COALESCE(a.isBlacklisted, false),
            a.createdAt = COALESCE(a.createdAt, datetime())
        RETURN a
    """.trimIndent()

    fun findAccountById() = "MATCH (a:Account {id: ${"$"}id}) RETURN a"

    fun findAccountByEmail() = "MATCH (a:Account {email: ${"$"}email}) RETURN a"

    fun updateTrustScore() = """
        MATCH (a:Account {id: ${"$"}id})
        SET a.trustScore = ${"$"}ts
        RETURN a
    """.trimIndent()

    fun flagAccount() = """
        MATCH (a:Account {id: ${"$"}id})
        SET a.isBlacklisted = true
        RETURN a
    """.trimIndent()

    fun unflagAccount() = """
        MATCH (a:Account {id: ${"$"}id})
        SET a.isBlacklisted = false
        RETURN a
    """.trimIndent()

    fun getFlaggedAccounts() = "MATCH (a:Account) WHERE a.isBlacklisted = true RETURN a"

    fun createCounterparty() = """
        MERGE (c:Counterparty {id: ${"$"}id})
        SET c.name = ${"$"}name, c.type = ${"$"}type, c.category = ${"$"}category,
            c.isBlacklisted = COALESCE(c.isBlacklisted, false),
            c.createdAt = COALESCE(c.createdAt, datetime())
        RETURN c
    """.trimIndent()

    fun findCounterpartyById() = "MATCH (c:Counterparty {id: ${"$"}id}) RETURN c"

    fun createTransaction() = """
        MATCH (a:Account {id: ${"$"}accountId})
        MATCH (c:Counterparty {id: ${"$"}counterpartyId})
        CREATE (a)-[:TRANSACTED_WITH {
            amount: ${"$"}amount, currency: ${"$"}currency,
            timestamp: datetime(${"$"}timestamp), transactionRef: ${"$"}transactionRef,
            sessionId: ${"$"}sessionId
        }]->(c)
    """.trimIndent()

    fun recentTransactions() = """
        MATCH (a:Account {id: ${"$"}id})-[t:TRANSACTED_WITH]->()
        RETURN t ORDER BY t.timestamp DESC LIMIT 20
    """.trimIndent()

    fun transactionCountInWindow() = """
        MATCH (a:Account {id: ${"$"}id})-[t:TRANSACTED_WITH]->()
        WHERE t.timestamp > datetime() - duration(${"$"}window)
        RETURN count(t) AS count
    """.trimIndent()

    fun pageRank() = """
        CALL page_rank.get("TRANSACTED_WITH", ["Account"], ["Counterparty"], 0.85)
        YIELD node, rank
        RETURN node.id AS id, rank
    """.trimIndent()

    fun proximityToBlacklisted() = """
        MATCH path = shortestPath(
            (a:Account {id: ${"$"}id})-[:TRANSACTED_WITH*]-(c:Counterparty)
        )
        WHERE c.isBlacklisted
        RETURN length(path) AS distance
        LIMIT 1
    """.trimIndent()

    fun graphNetwork() = """
        MATCH (a:Account)-[t:TRANSACTED_WITH]->(c:Counterparty)
        WHERE ${"$"}accountId IS NULL OR a.id = ${"$"}accountId
        RETURN a, t, c
        LIMIT ${"$"}limit
    """.trimIndent()
}
