package com.vantage.service

import ai.koog.agents.core.agent.AIAgent
import ai.koog.ktor.Koog
import com.vantage.AppContext
import com.vantage.model.Tier
import com.vantage.model.TrustScore
import io.ktor.server.application.*
import io.mockk.*
import kotlinx.coroutines.runBlocking
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertNotNull

class AiServiceTest {

    private val application = mockk<Application>(relaxed = true)
    private val agent = mockk<AIAgent<String, String>>(relaxed = true)

    @BeforeTest
    fun setup() {
        mockkObject(AppContext)
        every { AppContext.application } returns application
        
        val koog = mockk<Koog>(relaxed = true)
        every { application.plugin(Koog) } returns koog
        
        mockkStatic(AIAgent::class)
        val mBuilder = mockk<ai.koog.agents.core.agent.AIAgentBuilder>(relaxed = true)
        every { AIAgent.builder() } returns mBuilder
        every { mBuilder.promptExecutor(any()) } returns mBuilder
        every { mBuilder.llmModel(any()) } returns mBuilder
        every { mBuilder.systemPrompt(any()) } returns mBuilder
        every { mBuilder.build() } returns agent
    }

    @Test
    fun `test explain structure`() = runBlocking {
        val ts = TrustScore("acc1", 0.8, Tier.SAFE, 0.9, 0.1, 0.0)
        val service = AiService()
        val result = service.explain(ts)
        assertNotNull(result)
    }
}
