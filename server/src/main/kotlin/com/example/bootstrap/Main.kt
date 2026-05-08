package com.example.bootstrap

import com.example.config.AppConfig
import com.example.db.MemgraphClient
import io.ktor.server.engine.*
import io.ktor.server.netty.*

fun main(args: Array<String>) {
    EngineMain.main(args)
}

object AppContext {
    lateinit var config: AppConfig
    lateinit var memgraph: MemgraphClient
}
