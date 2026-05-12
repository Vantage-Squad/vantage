package com.vantage.service

import ai.koog.agents.AIAgent
import ai.koog.ktor.aiAgent
import com.vantage.AppContext
import com.vantage.model.Tier
import com.vantage.model.TrustScore
import io.ktor.server.application.*
import io.mockk.*
import kotlinx.coroutines.runBlocking
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class AiServiceTest {

    private val application = mockk<Application>(relaxed = true)
    private val agent = mockk<AIAgent>()

    @BeforeTest
    fun setup() {
        mockkObject(AppContext)
        every { AppContext.application } returns application
        // Mock the extension property aiAgent
        mockkStatic("ai.koog.ktor.KoogKt")
        every { application.aiAgent } returns agent
    }

    @Test
    fun `test explain uses agent and parses response`() = runBlocking {
        val ts = TrustScore("acc1", 0.8, Tier.GREEN, 0.9, 0.1, 0.0)
        val mockResponse = """
            Verdict: PASS
            Summary: Account looks safe.
            Risk Factors: None
            Action: Allow
        """.trimIndent()

        coEvery { agent.prompt(any()) } returns mockResponse

        val service = AiService()
        val result = service.explain(ts)

        assertEquals("PASS", result.verdict)
        assertEquals("Account looks safe.", result.summary)
        assertTrue(result.riskFactors.contains("None"))
        assertEquals("Allow", result.recommendedAction)
    }

    @Test
    fun `test explain falls back to template on error`() = runBlocking {
        val ts = TrustScore("acc1", 0.3, Tier.RED, 0.1, 0.8, 0.5)

        coEvery { agent.prompt(any()) } throws Exception("AI Failed")

        val service = AiService()
        val result = service.explain(ts)

        assertEquals("BLOCK", result.verdict)
        assertTrue(result.summary.contains("Trust score 0.3"))
        assertTrue(result.riskFactors.contains("High transaction velocity — possible mule behavior"))
        assertTrue(result.recommendedAction.contains("Block transaction"))
    }
}
