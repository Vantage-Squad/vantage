package com.vantage.bootstrap

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    routing {
        get("/health") {
            call.respondText("""{"status":"ok","service":"vantage"}""", ContentType.Application.Json)
        }
    }
}
