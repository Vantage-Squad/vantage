package com.example.model

import kotlinx.serialization.Serializable

@Serializable
enum class CounterpartyType {
    MERCHANT, INDIVIDUAL, BILLER, VIRTUAL_ACCOUNT
}

@Serializable
data class Counterparty(
    val id: String,
    val name: String? = null,
    val type: CounterpartyType = CounterpartyType.MERCHANT,
    val category: String? = null,
    val isBlacklisted: Boolean = false,
    val createdAt: String? = null
)
