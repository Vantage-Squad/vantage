package com.vantage.db

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import java.util.UUID

@kotlinx.serialization.Serializable
data class User(
    val id: String,
    val email: String,
    val passwordHash: String,
    val role: String
)

object UserRepository {
    
    suspend fun findByEmail(email: String): User? = PostgresDatabase.dbQuery {
        UsersTable.select { UsersTable.email eq email }
            .map { rowToUser(it) }
            .singleOrNull()
    }

    suspend fun create(email: String, passwordHash: String, role: String): User = PostgresDatabase.dbQuery {
        val id = UUID.randomUUID()
        UsersTable.insert {
            it[this.id] = id
            it[this.email] = email
            it[this.passwordHash] = passwordHash
            it[this.role] = role
        }
        User(id.toString(), email, passwordHash, role)
    }

    private fun rowToUser(row: ResultRow) = User(
        id = row[UsersTable.id].toString(),
        email = row[UsersTable.email],
        passwordHash = row[UsersTable.passwordHash],
        role = row[UsersTable.role]
    )
}
