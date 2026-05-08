package com.example.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class SquadWebhookPayload(
    @SerialName("Event") val event: String,
    @SerialName("TransactionRef") val transactionRef: String,
    @SerialName("Body") val body: SquadWebhookBody
)

@Serializable
data class SquadWebhookBody(
    val amount: Double,
    @SerialName("transaction_ref") val transactionRef: String,
    @SerialName("gateway_ref") val gatewayRef: String? = null,
    @SerialName("transaction_status") val transactionStatus: String,
    val email: String? = null,
    @SerialName("merchant_id") val merchantId: String,
    val currency: String = "NGN",
    @SerialName("transaction_type") val transactionType: String? = null,
    @SerialName("merchant_amount") val merchantAmount: Double? = null,
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("customer_mobile") val customerMobile: String? = null,
    val meta: Map<String, String>? = null,
    @SerialName("payment_information") val paymentInformation: SquadPaymentInfo? = null,
    @SerialName("is_recurring") val isRecurring: Boolean = false
)

@Serializable
data class SquadPaymentInfo(
    @SerialName("payment_type") val paymentType: String? = null,
    val pan: String? = null,
    @SerialName("card_type") val cardType: String? = null,
    @SerialName("token_id") val tokenId: String? = null
)

@Serializable
data class SquadVerificationResponse(
    val status: Int,
    val success: Boolean,
    val message: String,
    val data: SquadVerificationData? = null
)

@Serializable
data class SquadVerificationData(
    @SerialName("transaction_amount") val transactionAmount: Double? = null,
    @SerialName("transaction_ref") val transactionRef: String? = null,
    val email: String? = null,
    @SerialName("transaction_status") val transactionStatus: String? = null,
    @SerialName("merchant_name") val merchantName: String? = null,
    @SerialName("merchant_id") val merchantId: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class SquadInitiateRequest(
    val email: String,
    val amount: Int,
    val currency: String = "NGN",
    @SerialName("initiate_type") val initiateType: String = "inline",
    @SerialName("transaction_ref") val transactionRef: String? = null,
    val metadata: Map<String, String>? = null
)
