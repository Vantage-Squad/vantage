package com.vantage.bootstrap

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.openapi.*
import io.ktor.server.plugins.swagger.*
import io.ktor.server.routing.*
fun Application.configureHttp() {
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        allowHeader("X-Squad-Encrypted-Body")
        allowNonSimpleContentTypes = true
        anyHost() // Relaxed for dev, should be restricted in prod
        allowHost("localhost:3000")
        allowHost("127.0.0.1:5173")
        allowHost("127.0.0.1:3000")
        anyHost()
    }
    routing {
        openAPI(path = "openapi") {}
        swaggerUI(path = "openapi") {}
    }
}
