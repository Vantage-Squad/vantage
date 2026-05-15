package com.vantage.auth

import com.password4j.Password
import com.password4j.types.Argon2

object SecurityUtils {

    /**
     * Hashes a password using Argon2id with default parameters.
     * m=65536 (64MB), t=3 (iterations), p=4 (parallelism)
     */
    fun hashPassword(password: String): String {
        return Password.hash(password)
            .withArgon2()
            .getResult()
    }

    /**
     * Verifies a password against an Argon2id hash.
     */
    fun verifyPassword(password: String, hash: String): Boolean {
        return Password.check(password, hash).withArgon2()
    }
}
