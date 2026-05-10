package com.vantage.model

import kotlinx.serialization.Serializable

@Serializable
data class Account(
    val id: String,
    val email: String? = null,
    val bvn: String? = null,
    val nin: String? = null,
    val deviceFingerprint: String? = null,
    val ipAddress: String? = null,
    val geoCity: String? = null,
    val geoCountry: String? = null,
    val trustScore: Double = 0.5,
    val isBlacklisted: Boolean = false,
    val createdAt: String? = null
)

@Serializable
data class AccountCreateRequest(
    val id: String,
    val email: String? = null,
    val bvn: String? = null,
    val nin: String? = null,
    val deviceFingerprint: String? = null,
    val ipAddress: String? = null
)

@Serializable
data class BatchImportRequest(
    val accounts: List<AccountCreateRequest>
)
