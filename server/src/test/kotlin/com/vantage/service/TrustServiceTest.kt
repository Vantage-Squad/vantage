package com.vantage.service

import com.vantage.AppContext
import com.vantage.config.AppConfig
import com.vantage.db.MemgraphClient
import com.vantage.model.Tier
import io.mockk.*
import kotlinx.coroutines.runBlocking
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TrustServiceTest {

    private val memgraph = mockk<MemgraphClient>(relaxed = true)
    private val config = mockk<AppConfig>()

    @BeforeTest
    fun setup() {
        mockkObject(AppContext)
        every { AppContext.memgraph } returns memgraph
        every { AppContext.config } returns config

        // Config values: PageRank (0.7) + Velocity (0.2) - Proximity (0.1)
        every { config.trustScoreAlpha } returns 0.7
        every { config.trustScoreBeta } returns 0.2
        every { config.trustScoreGamma } returns 0.1
        every { config.trustScoreSafeThreshold } returns 0.6
        every { config.trustScoreHighRiskThreshold } returns 0.3
    }

    @Test
    fun `test compute trust score for healthy account`() = runBlocking {
        // PageRank result
        coEvery { memgraph.query(any(), any()) } returns listOf(
            mapOf("id" to "acc1", "rank" to 0.9)
        )
        // Velocity result (4 windows)
        coEvery { memgraph.readSingle(any(), match { it["window"] == "PT1M" }) } returns mapOf("count" to 1)
        coEvery { memgraph.readSingle(any(), match { it["window"] == "PT5M" }) } returns mapOf("count" to 2)
        coEvery { memgraph.readSingle(any(), match { it["window"] == "PT1H" }) } returns mapOf("count" to 3)
        coEvery { memgraph.readSingle(any(), match { it["window"] == "PT24H" }) } returns mapOf("count" to 4)
        // Proximity result
        coEvery { memgraph.readSingle(any(), match { it["id"] == "acc1" && it.containsKey("distance") == false }) } returns null // No blacklisted nearby

        val service = TrustService()
        val result = service.compute("acc1")
        
        assertEquals("acc1", result.accountId)
        assertEquals(Tier.SAFE, result.tier)
    }

    @Test
    fun `test compute trust score for risky account`() = runBlocking {
        coEvery { memgraph.query(any(), any()) } returns listOf(
            mapOf("id" to "acc1", "rank" to 0.1)
        )
        // High velocity
        coEvery { memgraph.readSingle(any(), any()) } returns mapOf<String, Any>("count" to 50)
        // Close proximity
        coEvery { memgraph.readSingle(any(), any()) } returns mapOf<String, Any>("distance" to 1)

        val service = TrustService()
        val result = service.compute("acc1")
        
        assertEquals(Tier.CRITICAL, result.tier)
        assertTrue(result.ts < 0.2)
    }
}
