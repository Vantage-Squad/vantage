package com.vantage

import com.vantage.AppContext
import com.vantage.config.AppConfig
import com.vantage.bootstrap.configureRouting
import com.vantage.db.MemgraphClient
import com.vantage.service.SseService
import io.ktor.client.request.get
import io.ktor.http.*
import io.ktor.server.testing.testApplication
import kotlin.test.*

class ServerTest {

    @Test
    fun `test health endpoint`() = testApplication {
        application {
            AppContext.config = AppConfig(environment.config)
            AppContext.memgraph = MemgraphClient("bolt://localhost:7687")
            AppContext.sseService = SseService()
            configureRouting()
        }
        val response = client.get("/health")
        assertEquals(HttpStatusCode.OK, response.status)
    }
}
