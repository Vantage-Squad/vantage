package com.example.bootstrap

import com.example.config.AppConfig
import com.example.db.MemgraphClient
import com.example.db.SchemaSetup
import io.ktor.server.application.*
import kotlinx.coroutines.runBlocking

fun Application.configureStartup() {
    val appConfig = AppConfig(environment.config)
    val memgraph = MemgraphClient(
        appConfig.memgraphBoltUri,
        appConfig.memgraphUsername,
        appConfig.memgraphPassword
    )

    AppContext.config = appConfig
    AppContext.memgraph = memgraph

    monitor.subscribe(ApplicationStarted) {
        println("[Vantage] Server started. Running schema setup...")
        runBlocking {
            SchemaSetup(memgraph).run()
        }
        println("[Vantage] Ready on port ${environment.config.property("ktor.deployment.port").getString()}")
    }

    monitor.subscribe(ApplicationStopped) {
        println("[Vantage] Shutting down. Closing Memgraph connection...")
        memgraph.close()
    }
}
