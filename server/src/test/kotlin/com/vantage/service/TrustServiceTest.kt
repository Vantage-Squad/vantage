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

class TrustServiceTest {

    private val memgraph = mockk<MemgraphClient>(relaxed = true)
    private val config = mockk<AppConfig>()

    @BeforeTest
    fun setup() {
        mockkObject(AppContext)
        every { AppContext.memgraph } returns memgraph
        every { AppContext.config } returns config

        // Config values
        every { config.trustScoreAlpha } returns 0.35
        every { config.trustScoreBeta } returns 0.40
        every { config.trustScoreGamma } returns 0.25
        every { config.trustScoreSafeThreshold } returns 0.7
        every { config.trustScoreHighRiskThreshold } returns 0.4
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
        assertEquals(Tier.CRITICAL, result.tier) // 0.32 < 0.4
    }

    @Test
    fun `test compute trust score for risky account`() = runBlocking {
        coEvery { memgraph.query(any(), any()) } returns listOf(
            mapOf("id" to "acc1", "rank" to 0.1)
        )
        // High velocity
        coEvery { memgraph.readSingle(any(), any()) } returns mapOf("count" to 50)
        // Close proximity
        coEvery { memgraph.readSingle(any(), any()) } returns mapOf("distance" to 1)

        val service = TrustService()
        val result = service.compute("acc1")
        
        assertEquals(Tier.CRITICAL, result.tier)
        assertEquals(0.11, result.ts, 0.01)
    }
}
