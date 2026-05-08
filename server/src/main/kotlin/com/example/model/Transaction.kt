package com.example.model

import kotlinx.serialization.Serializable

@Serializable
data class Transaction(
    val transactionRef: String,
    val accountId: String,
    val counterpartyId: String,
    val amount: Double,
    val currency: String = "NGN",
    val timestamp: String? = null,
    val sessionId: String? = null,
    val riskFlag: String? = null,
    val metadata: String? = null,
    val counterpartyType: CounterpartyType = CounterpartyType.MERCHANT
)

@Serializable
data class TransactionCreateRequest(
    val accountId: String,
    val counterpartyId: String,
    val amount: Double,
    val currency: String = "NGN",
    val transactionRef: String,
    val sessionId: String? = null,
    val timestamp: String? = null,
    val counterpartyType: CounterpartyType = CounterpartyType.MERCHANT
)
