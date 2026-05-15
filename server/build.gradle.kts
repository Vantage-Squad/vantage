plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
    alias(ktorLibs.plugins.ktor)
}

group = "com.vantage"
version = "1.0.0-SNAPSHOT"

application {
    mainClass = "com.vantage.VantageServerKt"
}

kotlin {
    jvmToolchain(21)
}

dependencies {
    // Ktor server
    implementation(ktorLibs.server.callLogging)
    implementation(ktorLibs.server.config.yaml)
    implementation(ktorLibs.server.contentNegotiation)
    implementation(ktorLibs.server.core)
    implementation(ktorLibs.server.cors)
    implementation(ktorLibs.server.netty)
    implementation(ktorLibs.server.openapi)
    implementation(ktorLibs.server.routingOpenapi)
    implementation(ktorLibs.server.statusPages)
    implementation(ktorLibs.server.swagger)
    implementation(ktorLibs.server.sse)
    implementation(ktorLibs.server.auth)

    // Ktor client (for Squad API calls)
    implementation(ktorLibs.client.core)
    implementation(ktorLibs.client.contentNegotiation)
    implementation(ktorLibs.client.serialization)

    // Ktor serialization (kotlinx.json integration)
    implementation(ktorLibs.serialization.kotlinx.json)

    // Serialization
    implementation(libs.kotlinx.serialization.json)

    // Coroutines
    implementation(libs.kotlinx.coroutines.core)

    // Neo4j Bolt driver
    implementation(libs.neo4j.driver)

    // Koog AI agent
    implementation(libs.koog.agents)
    implementation(libs.koog.ktor)

    // Dotenv
    implementation(libs.dotenv.kotlin)

    // Logging
    implementation(libs.logback.classic)

    // Test
    testImplementation(kotlin("test"))
    testImplementation(libs.mockk)
    testImplementation(ktorLibs.server.testHost)
}
