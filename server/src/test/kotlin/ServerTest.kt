package com.vantage

import com.vantage.bootstrap.configureRouting
import io.ktor.client.request.get
import io.ktor.http.*
import io.ktor.server.testing.testApplication
import kotlin.test.*

class ServerTest {

    @Test
    fun `test health endpoint`() = testApplication {
        application {
            configureRouting()
        }
        val response = client.get("/health")
        assertEquals(HttpStatusCode.OK, response.status)
    }
}
