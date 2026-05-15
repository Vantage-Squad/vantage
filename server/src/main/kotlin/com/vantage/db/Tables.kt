package com.vantage.db

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp
import org.jetbrains.exposed.sql.json.jsonb
import kotlinx.serialization.json.JsonElement

object UsersTable : Table("users") {
    val id = uuid("id")
    val email = varchar("email", 255).uniqueIndex()
    val passwordHash = varchar("password_hash", 255)
    val role = varchar("role", 50)
    val createdAt = timestamp("created_at").defaultExpression(org.jetbrains.exposed.sql.javatime.CurrentTimestamp)

    override val primaryKey = PrimaryKey(id)
}

object TransactionHistoryTable : Table("transaction_history") {
    val id = uuid("id")
    val accountId = varchar("account_id", 255).index()
    val amount = decimal("amount", 20, 2)
    val status = varchar("status", 50)
    val trustScore = double("trust_score")
    val agentSummary = text("agent_summary").nullable()
    val metadata = jsonb<JsonElement>("metadata", kotlinx.serialization.json.Json)
    val isFalsePositive = bool("is_false_positive").default(false)
    val createdAt = timestamp("created_at").defaultExpression(org.jetbrains.exposed.sql.javatime.CurrentTimestamp)

    override val primaryKey = PrimaryKey(id)
}

object AccountStatesTable : Table("account_states") {
    val accountId = varchar("account_id", 255)
    val lastSeen = timestamp("last_seen").defaultExpression(org.jetbrains.exposed.sql.javatime.CurrentTimestamp)
    val isFrozen = bool("is_frozen").default(false)
    val frozenById = uuid("frozen_by_id").references(UsersTable.id).nullable()

    override val primaryKey = PrimaryKey(accountId)
}
