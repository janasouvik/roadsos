package com.roadguardian.app.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.roadguardian.app.databinding.ActivityLoginBinding

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupClickListeners()
    }

    private fun setupClickListeners() {

        binding.btnLogin.setOnClickListener {
            val email = binding.emailInput.text?.toString()?.trim() ?: ""
            val password = binding.passwordInput.text?.toString() ?: ""

            if (email.isEmpty()) {
                binding.emailLayout.error = "Email is required"
                return@setOnClickListener
            }
            if (password.isEmpty()) {
                binding.passwordLayout.error = "Password is required"
                return@setOnClickListener
            }

            binding.emailLayout.error = null
            binding.passwordLayout.error = null

            // Save login state & navigate
            performLogin(email, password)
        }

        binding.btnEmergencyGuest.setOnClickListener {
            // Emergency guest access - go directly to dashboard
            getSharedPreferences("road_guardian", MODE_PRIVATE).edit()
                .putBoolean("is_logged_in", true)
                .putString("user_name", "Guest User")
                .apply()
            navigateToDashboard()
        }

        binding.btnRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        binding.forgotPassword.setOnClickListener {
            Toast.makeText(this, "Password reset link sent to your email", Toast.LENGTH_SHORT).show()
        }
    }

    private fun performLogin(email: String, password: String) {
        binding.btnLogin.isEnabled = false
        binding.btnLogin.text = "Signing in..."

        // Simulate API call
        binding.root.postDelayed({
            binding.btnLogin.isEnabled = true
            binding.btnLogin.text = "Sign In"

            // Store login
            getSharedPreferences("road_guardian", MODE_PRIVATE).edit()
                .putBoolean("is_logged_in", true)
                .putString("user_name", email.substringBefore("@").replaceFirstChar { it.uppercase() })
                .putString("user_email", email)
                .apply()

            navigateToDashboard()
        }, 1500)
    }

    private fun navigateToDashboard() {
        startActivity(Intent(this, DashboardActivity::class.java))
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        finish()
    }
}
