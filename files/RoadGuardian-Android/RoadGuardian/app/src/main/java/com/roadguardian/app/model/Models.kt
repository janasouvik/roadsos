package com.roadguardian.app.model

data class Incident(
    val type: String,
    val location: String,
    val time: String,
    val severity: String,
    val severityColor: String
)

data class ChatMessage(
    val text: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)

data class ServiceProvider(
    val id: String,
    val name: String,
    val type: String,
    val address: String,
    val phone: String,
    val distance: String,
    val isAvailable: Boolean
)

data class SosRequest(
    val id: String,
    val latitude: Double,
    val longitude: Double,
    val address: String,
    val emergencyType: String,
    val status: String,
    val createdAt: String
)

data class User(
    val id: String,
    val fullName: String,
    val email: String,
    val phone: String,
    val avatar: String? = null,
    val role: String = "USER"
)

data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null
)
