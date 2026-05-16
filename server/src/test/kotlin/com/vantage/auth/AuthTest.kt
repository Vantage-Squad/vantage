package com.vantage.auth

import com.vantage.AppContext
import com.vantage.config.AppConfig
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.mockk.*
import java.time.Instant
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue
import kotlin.test.assertFalse
import kotlinx.coroutines.runBlocking

class AuthTest {

    private val config = mockk<AppConfig>()

    @BeforeTest
    fun setup() {
        mockkObject(AppContext)
        every { AppContext.config } returns config
    }

    @Test
    fun `test sha256 hashing`() {
        val input = "password"
        val hash = sha256(input)
        assertEquals(64, hash.length)
        assertEquals(sha256(input), hash)
    }

    @Test
    fun `test jwt creation and verification`() {
        val secret = "test-secret"
        val now = Instant.now().epochSecond
        val payload = JwtPayload(sub = "user1", email = "test@vantage.com", role = "ADMIN", iat = now, exp = now + 100)
        
        val token = createJwt(payload, secret)
        assertNotNull(token)
        assertTrue(token.split(".").size == 3)

        val verified = verifyJwt(token, secret)
        assertNotNull(verified)
        assertEquals("user1", verified.sub)
        assertEquals("test@vantage.com", verified.email)
    }

    @Test
    fun `test expired jwt verification`() {
        val secret = "test-secret"
        val now = Instant.now().epochSecond
        val payload = JwtPayload(sub = "user1", email = "test@vantage.com", role = "ADMIN", iat = now - 200, exp = now - 100)
        
        val token = createJwt(payload, secret)
        val verified = verifyJwt(token, secret)
        assertNull(verified)
    }

    @Test
    fun `test authenticateRequest with api key`() {
        val call = mockk<ApplicationCall>()
        val request = mockk<ApplicationRequest>()
        every { config.apiKey } returns "valid-api-key"
        every { call.request } returns request
        every { request.header(HttpHeaders.Authorization) } returns "Bearer valid-api-key"

        runBlocking {
            assertTrue(authenticateRequest(call))
        }
    }

    @Test
    fun `test hmac verification`() {
        val secret = "squad-secret"
        val body = "{\"event\":\"test\"}"
        val signature = hmacSha512(body.toByteArray(), secret)
        
        assertTrue(verifyHmacSignature(body.toByteArray(), signature, secret))
        assertFalse(verifyHmacSignature(body.toByteArray(), "wrong-signature", secret))
    }
}
