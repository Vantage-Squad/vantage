package com.vantage.db

import kotlin.test.Test
import kotlin.test.assertTrue

class QueriesTest {

    @Test
    fun testCreateAccountQuery() {
        val query = Queries.createAccount()
        assertTrue(query.contains("MERGE (a:Account {id: ${"$"}id})"))
        assertTrue(query.contains("SET a.email = ${"$"}email"))
        assertTrue(query.contains("RETURN a"))
    }

    @Test
    fun testFindAccountByIdQuery() {
        val query = Queries.findAccountById()
        assertTrue(query.contains("MATCH (a:Account {id: ${"$"}id})"))
    }

    @Test
    fun testCreateTransactionQuery() {
        val query = Queries.createTransaction()
        assertTrue(query.contains("MATCH (a:Account {id: ${"$"}accountId})"))
        assertTrue(query.contains("MATCH (c:Counterparty {id: ${"$"}counterpartyId})"))
        assertTrue(query.contains("CREATE (a)-[:TRANSACTED_WITH"))
    }

    @Test
    fun testPageRankQuery() {
        val query = Queries.pageRank()
        assertTrue(query.contains("CALL page_rank.get"))
    }

    @Test
    fun testProximityQuery() {
        val query = Queries.proximityToBlacklisted()
        assertTrue(query.contains("shortestPath"))
        assertTrue(query.contains("c.isBlacklisted"))
    }
    
    @Test
    fun testGraphNetworkQuery() {
        val query = Queries.graphNetwork()
        assertTrue(query.contains("MATCH (a:Account)-[t:TRANSACTED_WITH]->(c:Counterparty)"))
        assertTrue(query.contains("LIMIT ${"$"}limit"))
    }
}
