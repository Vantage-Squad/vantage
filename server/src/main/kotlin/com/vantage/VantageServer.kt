package com.vantage

import com.vantage.config.AppConfig
import com.vantage.db.MemgraphClient
import com.vantage.service.SseService

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

object AppContext {
    lateinit var config: AppConfig
    lateinit var memgraph: MemgraphClient
    lateinit var sseService: SseService
}
