package com.vantage.model

import kotlinx.serialization.Serializable

@Serializable
enum class Tier { GREEN, AMBER, RED }

@Serializable
data class TrustScore(
    val accountId: String,
    val ts: Double,
    val tier: Tier,
    val cpr: Double,
    val vvel: Double,
    val pdist: Double,
    val explanation: VerdictExplanation? = null
)

@Serializable
data class TrustScoreComponents(
    val cpr: Double,
    val vvel: Double,
    val pdist: Double
)

@Serializable
data class VerdictExplanation(
    val verdict: String,
    val summary: String,
    val riskFactors: List<String> = emptyList(),
    val recommendedAction: String = ""
)
