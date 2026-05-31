package com.roadguardian.app.ui

import android.os.Bundle
import android.view.inputmethod.EditorInfo
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.roadguardian.app.adapter.ChatAdapter
import com.roadguardian.app.databinding.ActivityAiChatBinding
import com.roadguardian.app.model.ChatMessage
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class AiChatActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAiChatBinding
    private val chatMessages = mutableListOf<ChatMessage>()
    private lateinit var chatAdapter: ChatAdapter
    private val client = OkHttpClient()

    // System prompt for Road Guardian AI
    private val SYSTEM_PROMPT = """You are Road Guardian AI, an emergency response assistant for road accidents and safety.
        You help users with:
        - Emergency first aid guidance after accidents
        - Step-by-step instructions during road emergencies
        - Information about what to do in vehicle fires, floods, or breakdowns
        - Connecting to nearby emergency services
        - Road safety tips and accident prevention
        - How to report accidents to authorities
        
        Always be calm, clear, and concise. Prioritize life safety. 
        In critical emergencies, always advise calling 112 immediately.
        Respond in a supportive, professional tone. Keep responses concise and actionable."""

    // Replace with your actual Gemini API key
    private val GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
    private val GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GEMINI_API_KEY"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAiChatBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupChat()
        setupInput()
        setupChips()

        binding.backBtn.setOnClickListener { finish() }
    }

    private fun setupChat() {
        chatAdapter = ChatAdapter(chatMessages)
        binding.chatRecycler.apply {
            layoutManager = LinearLayoutManager(this@AiChatActivity).also {
                it.stackFromEnd = true
            }
            adapter = chatAdapter
        }

        // Add greeting message
        addAiMessage(getString(com.roadguardian.app.R.string.ai_greeting))
    }

    private fun setupInput() {
        binding.sendBtn.setOnClickListener {
            sendMessage()
        }

        binding.messageInput.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEND) {
                sendMessage()
                true
            } else false
        }
    }

    private fun setupChips() {
        // Quick help chips from HorizontalScrollView
        binding.quickHelpContainer.let { container ->
            for (i in 0 until container.childCount) {
                container.getChildAt(i).setOnClickListener { chip ->
                    val text = (chip as? com.google.android.material.chip.Chip)?.text?.toString() ?: return@setOnClickListener
                    binding.messageInput.setText(text.removePrefix("🚨 ").removePrefix("🔥 ")
                        .removePrefix("🏥 ").removePrefix("🚔 "))
                    sendMessage()
                }
            }
        }
    }

    private fun sendMessage() {
        val text = binding.messageInput.text?.toString()?.trim() ?: return
        if (text.isEmpty()) return

        binding.messageInput.text?.clear()

        // Add user message
        chatMessages.add(ChatMessage(text, isUser = true))
        chatAdapter.notifyItemInserted(chatMessages.size - 1)
        scrollToBottom()

        // Show typing indicator
        binding.typingIndicator.visibility = android.view.View.VISIBLE

        // Call Gemini API
        callGeminiApi(text)
    }

    private fun callGeminiApi(userMessage: String) {
        val json = JSONObject().apply {
            put("contents", JSONArray().apply {
                // System context
                put(JSONObject().apply {
                    put("role", "user")
                    put("parts", JSONArray().put(JSONObject().put("text", SYSTEM_PROMPT)))
                })
                put(JSONObject().apply {
                    put("role", "model")
                    put("parts", JSONArray().put(JSONObject().put("text", "Understood. I'm Road Guardian AI, ready to assist with road emergency guidance.")))
                })

                // Conversation history
                chatMessages.forEach { msg ->
                    put(JSONObject().apply {
                        put("role", if (msg.isUser) "user" else "model")
                        put("parts", JSONArray().put(JSONObject().put("text", msg.text)))
                    })
                }

                // Current user message
                put(JSONObject().apply {
                    put("role", "user")
                    put("parts", JSONArray().put(JSONObject().put("text", userMessage)))
                })
            })
            put("generationConfig", JSONObject().apply {
                put("temperature", 0.4)
                put("maxOutputTokens", 512)
            })
        }

        val body = json.toString().toRequestBody("application/json".toMediaType())
        val request = Request.Builder()
            .url(GEMINI_URL)
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    binding.typingIndicator.visibility = android.view.View.GONE
                    addAiMessage("I'm having trouble connecting right now. For immediate emergencies, please call 112.")
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    binding.typingIndicator.visibility = android.view.View.GONE
                    try {
                        val responseBody = response.body?.string() ?: ""
                        val jsonResponse = JSONObject(responseBody)
                        val aiText = jsonResponse
                            .getJSONArray("candidates")
                            .getJSONObject(0)
                            .getJSONObject("content")
                            .getJSONArray("parts")
                            .getJSONObject(0)
                            .getString("text")
                        addAiMessage(aiText)
                    } catch (e: Exception) {
                        addAiMessage("I encountered an error. For emergencies, call 112 immediately.")
                    }
                }
            }
        })
    }

    private fun addAiMessage(text: String) {
        chatMessages.add(ChatMessage(text, isUser = false))
        chatAdapter.notifyItemInserted(chatMessages.size - 1)
        scrollToBottom()
    }

    private fun scrollToBottom() {
        if (chatMessages.isNotEmpty()) {
            binding.chatRecycler.smoothScrollToPosition(chatMessages.size - 1)
        }
    }
}
