package com.roadguardian.app.ui

import android.content.Intent
import android.os.Bundle
import android.view.animation.AnimationUtils
import androidx.appcompat.app.AppCompatActivity
import com.roadguardian.app.R
import com.roadguardian.app.databinding.ActivitySplashBinding

class SplashActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySplashBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Animate logo and loading
        binding.logoContainer.animate()
            .alpha(1f)
            .scaleX(1f)
            .scaleY(1f)
            .setDuration(800)
            .setStartDelay(300)
            .withEndAction {
                binding.loadingContainer.animate()
                    .alpha(1f)
                    .setDuration(500)
                    .start()
            }
            .start()

        // Navigate after delay
        binding.root.postDelayed({
            val sharedPrefs = getSharedPreferences("road_guardian", MODE_PRIVATE)
            val isLoggedIn = sharedPrefs.getBoolean("is_logged_in", false)

            val intent = if (isLoggedIn) {
                Intent(this, DashboardActivity::class.java)
            } else {
                Intent(this, LoginActivity::class.java)
            }
            startActivity(intent)
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            finish()
        }, 2500)
    }
}
