package com.roadguardian.app.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.animation.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import com.roadguardian.app.databinding.ActivitySosBinding

class SosActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySosBinding
    private var countdownTimer: Int = 10
    private var timerRunnable: Runnable? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySosBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Vibrate on SOS
        val vibrator = getSystemService(VIBRATOR_SERVICE) as? Vibrator
        vibrator?.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 500, 200, 500, 200, 1000), -1))

        startCountdown()
        setupButtons()
        startPulse()
    }

    private fun startPulse() {
        val pulse = ScaleAnimation(1f, 1.08f, 1f, 1.08f,
            Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF, 0.5f).apply {
            duration = 600; repeatMode = Animation.REVERSE; repeatCount = Animation.INFINITE
        }
        binding.sosBigBtn.startAnimation(pulse)
    }

    private fun startCountdown() {
        countdownTimer = 10
        updateCountdownText()

        timerRunnable = object : Runnable {
            override fun run() {
                countdownTimer--
                updateCountdownText()
                if (countdownTimer <= 0) {
                    sendEmergencyAlert()
                } else {
                    binding.root.postDelayed(this, 1000)
                }
            }
        }
        binding.root.postDelayed(timerRunnable!!, 1000)
    }

    private fun updateCountdownText() {
        binding.countdownText.text = "Alerting authorities in $countdownTimer seconds..."
    }

    private fun setupButtons() {
        binding.cancelSosBtn.setOnClickListener {
            timerRunnable?.let { binding.root.removeCallbacks(it) }
            finish()
        }

        binding.callNowBtn.setOnClickListener {
            callEmergency("112")
        }

        binding.sosBigBtn.setOnClickListener {
            callEmergency("112")
        }
    }

    private fun sendEmergencyAlert() {
        binding.statusText.text = "✅ Emergency alert sent to authorities!"
        binding.locationStatus.text = "📍 Live location shared with emergency services"
        binding.countdownText.text = "Help is on the way"

        // Auto call after alert
        binding.root.postDelayed({
            callEmergency("112")
        }, 2000)
    }

    private fun callEmergency(number: String) {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CALL_PHONE)
            == PackageManager.PERMISSION_GRANTED) {
            startActivity(Intent(Intent.ACTION_CALL, Uri.parse("tel:$number")))
        } else {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CALL_PHONE), 101)
            startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$number")))
        }
    }

    override fun onDestroy() {
        timerRunnable?.let { binding.root.removeCallbacks(it) }
        super.onDestroy()
    }
}
