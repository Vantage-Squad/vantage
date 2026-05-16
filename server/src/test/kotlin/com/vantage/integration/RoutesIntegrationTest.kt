package com.vantage.integration

import com.vantage.AppContext
import com.vantage.bootstrap.configureHttp
import com.vantage.bootstrap.configureRouting
import com.vantage.bootstrap.configureSerialization
import com.vantage.bootstrap.configureStatusPages
import com.vantage.config.AppConfig
import com.vantage.db.MemgraphClient
import com.vantage.service.SseService
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.testing.*
import io.mockk.*
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals

class RoutesIntegrationTest {

    private val memgraph = mockk<MemgraphClient>(relaxed = true)
    private val config = mockk<AppConfig>(relaxed = true)

    @BeforeTest
    fun setup() {
        mockkObject(AppContext)
        val app = mockk<Application>(relaxed = true)
        every { AppContext.application } returns app
        every { AppContext.memgraph } returns memgraph
        every { AppContext.config } returns config
        every { AppContext.sseService } returns SseService()
        
        every { config.apiKey } returns "test-key"
    }

    @Test
    fun `test health endpoint`() = testApplication {
        application {
            configureRouting()
        }
        val response = client.get("/health")
        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("""{"status":"ok","service":"vantage"}""", response.bodyAsText())
    }

    @Test
    fun `test unauthorized access to protected route`() = testApplication {
        application {
            configureRouting()
        }
        val response = client.get("/api/v1/admin/flagged")
        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    @Test
    fun `test authorized access with api key`() = testApplication {
        application {
            configureRouting()
        }
        
        // Mock memgraph for flagged accounts
        coEvery { memgraph.query(any()) } returns emptyList()

        val response = client.get("/api/v1/admin/flagged") {
            header(HttpHeaders.Authorization, "Bearer test-key")
        }
        assertEquals(HttpStatusCode.OK, response.status)
    }
}
