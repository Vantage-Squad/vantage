package com.vantage.auth

import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

fun verifyHmacSignature(body: ByteArray, signature: String, secret: String): Boolean {
    val expected = hmacSha512(body, secret)
    return signature == expected
}

fun hmacSha512(data: ByteArray, secret: String): String {
    val mac = Mac.getInstance("HmacSHA512")
    mac.init(SecretKeySpec(secret.toByteArray(), "HmacSHA512"))
    return mac.doFinal(data).joinToString("") { "%02x".format(it) }
}
