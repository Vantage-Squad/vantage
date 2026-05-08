package com.example.enrichment

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

class GeoIpService {
    private val client = HttpClient()
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun lookup(ip: String): GeoLocation? {
        return try {
            val response: HttpResponse = client.get("http://ip-api.com/json/$ip?fields=city,country,status")
            if (response.status.value == 200) {
                val result = json.decodeFromString<IpApiResponse>(response.bodyAsText())
                if (result.status == "success") GeoLocation(result.city, result.country)
                else null
            } else null
        } catch (_: Exception) {
            null
        }
    }
}

@Serializable
data class IpApiResponse(val status: String, val city: String, val country: String)

data class GeoLocation(val city: String, val country: String)
