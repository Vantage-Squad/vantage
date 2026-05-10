package com.vantage.model

import kotlinx.serialization.Serializable

@Serializable
data class AdminUser(
    val id: String,
    val email: String,
    val passwordHash: String,
    val createdAt: String? = null,
    val lastLoginAt: String? = null
)
