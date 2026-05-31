package com.roadguardian.app.ui

import android.content.Intent
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.MotionEvent
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.view.animation.ScaleAnimation
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.roadguardian.app.R
import com.roadguardian.app.adapter.IncidentAdapter
import com.roadguardian.app.databinding.ActivityDashboardBinding
import com.roadguardian.app.model.Incident

class DashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDashboardBinding
    private var sosHoldTimer: Runnable? = null
    private var sosCountdown = 3
    private var pulseAnimation: Animation? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupHeader()
        setupSosButton()
        setupServiceGrid()
        setupBottomNav()
        setupRecentIncidents()
        startPulseAnimation()
    }

    private fun setupHeader() {
        val prefs = getSharedPreferences("road_guardian", MODE_PRIVATE)
        val userName = prefs.getString("user_name", "Guardian") ?: "Guardian"
        binding.greetingName.text = userName
    }

    private fun startPulseAnimation() {
        val pulse = ScaleAnimation(
            1f, 1.1f, 1f, 1.1f,
            Animation.RELATIVE_TO_SELF, 0.5f,
            Animation.RELATIVE_TO_SELF, 0.5f
        ).apply {
            duration = 800
            repeatMode = Animation.REVERSE
            repeatCount = Animation.INFINITE
        }
        binding.sosRing1.startAnimation(pulse)

        val pulse2 = ScaleAnimation(
            1f, 1.12f, 1f, 1.12f,
            Animation.RELATIVE_TO_SELF, 0.5f,
            Animation.RELATIVE_TO_SELF, 0.5f
        ).apply {
            duration = 1000
            repeatMode = Animation.REVERSE
            repeatCount = Animation.INFINITE
            startOffset = 200
        }
        binding.sosRing2.startAnimation(pulse2)

        val pulse3 = ScaleAnimation(
            1f, 1.15f, 1f, 1.15f,
            Animation.RELATIVE_TO_SELF, 0.5f,
            Animation.RELATIVE_TO_SELF, 0.5f
        ).apply {
            duration = 1200
            repeatMode = Animation.REVERSE
            repeatCount = Animation.INFINITE
            startOffset = 400
        }
        binding.sosRing3.startAnimation(pulse3)
    }

    private fun setupSosButton() {
        val vibrator = getSystemService(VIBRATOR_SERVICE) as? Vibrator

        binding.sosButton.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    sosCountdown = 3
                    vibrator?.vibrate(VibrationEffect.createOneShot(100, VibrationEffect.DEFAULT_AMPLITUDE))
                    binding.sosButton.animate().scaleX(0.9f).scaleY(0.9f).setDuration(100).start()
                    startSosCountdown()
                    true
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    cancelSos()
                    binding.sosButton.animate().scaleX(1f).scaleY(1f).setDuration(100).start()
                    true
                }
                else -> false
            }
        }
    }

    private fun startSosCountdown() {
        sosHoldTimer = Runnable {
            sosCountdown--
            if (sosCountdown <= 0) {
                triggerSOS()
            } else {
                binding.root.postDelayed(sosHoldTimer!!, 1000)
            }
        }
        binding.root.postDelayed(sosHoldTimer!!, 1000)
    }

    private fun cancelSos() {
        sosHoldTimer?.let { binding.root.removeCallbacks(it) }
        sosHoldTimer = null
    }

    private fun triggerSOS() {
        cancelSos()
        startActivity(Intent(this, SosActivity::class.java))
    }

    private fun setupServiceGrid() {
        binding.cardReportAccident.setOnClickListener {
            startActivity(Intent(this, ReportAccidentActivity::class.java))
        }
        binding.cardAiGuide.setOnClickListener {
            startActivity(Intent(this, AiChatActivity::class.java))
        }
        binding.cardNearbyHelp.setOnClickListener {
            startActivity(Intent(this, MapActivity::class.java))
        }
        binding.cardEmergencyContacts.setOnClickListener {
            startActivity(Intent(this, EmergencyContactsActivity::class.java))
        }
        binding.cardLiveMap.setOnClickListener {
            startActivity(Intent(this, MapActivity::class.java))
        }
        binding.cardMyReports.setOnClickListener {
            startActivity(Intent(this, MyReportsActivity::class.java))
        }
        binding.notificationBtn.setOnClickListener {
            // Open notifications
        }
        binding.profileBtn.setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }
    }

    private fun setupBottomNav() {
        binding.bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> true
                R.id.nav_map -> {
                    startActivity(Intent(this, MapActivity::class.java))
                    true
                }
                R.id.nav_report -> {
                    startActivity(Intent(this, ReportAccidentActivity::class.java))
                    true
                }
                R.id.nav_ai -> {
                    startActivity(Intent(this, AiChatActivity::class.java))
                    true
                }
                R.id.nav_profile -> {
                    startActivity(Intent(this, ProfileActivity::class.java))
                    true
                }
                else -> false
            }
        }
        binding.bottomNav.selectedItemId = R.id.nav_home
    }

    private fun setupRecentIncidents() {
        val incidents = listOf(
            Incident("Vehicle Collision", "NH-44, 2 km ahead", "10 min ago", "CRITICAL", "#EF4444"),
            Incident("Road Block", "Ring Road Junction", "25 min ago", "MODERATE", "#F59E0B"),
            Incident("Minor Accident", "City Center Bridge", "1 hr ago", "MINOR", "#22C55E")
        )

        binding.incidentsRecycler.layoutManager = LinearLayoutManager(this)
        binding.incidentsRecycler.adapter = IncidentAdapter(incidents)

        binding.viewAllBtn.setOnClickListener {
            startActivity(Intent(this, MyReportsActivity::class.java))
        }
    }

    override fun onDestroy() {
        cancelSos()
        super.onDestroy()
    }
}
