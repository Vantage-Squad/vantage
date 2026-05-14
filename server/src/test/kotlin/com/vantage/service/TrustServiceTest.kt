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
        every { config.trustScoreGreenThreshold } returns 0.7
        every { config.trustScoreAmberThreshold } returns 0.4
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

        // Ts = 0.35 * 0.9 + 0.40 * (weighted_avg / 100) - 0.25 * 0
        // weighted_avg = (1*30 + 2*20 + 3*10 + 4*5) / 65 = (30+40+30+20)/65 = 120/65 = 1.84
        // vvel = 1.84 / 100 = 0.0184
        // Ts = 0.315 + 0.00736 - 0 = 0.32236 -> Wait, Coerced in 0.0, 1.0
        
        assertEquals("acc1", result.accountId)
        assertEquals(Tier.RED, result.tier) // 0.32 < 0.4
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
        
        // Ts = 0.35*0.1 + 0.40*(50*65/65/100) - 0.25*(1/2)
        // Ts = 0.035 + 0.20 - 0.125 = 0.11
        assertEquals(Tier.RED, result.tier)
        assertEquals(0.11, result.ts, 0.01)
    }
}
