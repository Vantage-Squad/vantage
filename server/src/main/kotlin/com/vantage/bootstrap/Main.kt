package com.vantage.bootstrap

import com.vantage.config.AppConfig
import com.vantage.db.MemgraphClient
import io.ktor.server.netty.*

fun main(args: Array<String>) {
    EngineMain.main(args)
}

object AppContext {
    lateinit var config: AppConfig
    lateinit var memgraph: MemgraphClient
}
