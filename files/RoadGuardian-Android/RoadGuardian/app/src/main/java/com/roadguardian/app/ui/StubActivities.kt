package com.roadguardian.app.ui

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.roadguardian.app.R

class MapActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_map)
    }
}

class MyReportsActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_my_reports)
    }
}

class ProfileActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)
    }
}

class RegisterActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)
    }
}

class ReportAccidentActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_report_accident)
        findViewById<android.view.View>(R.id.backBtn).setOnClickListener { finish() }
        findViewById<android.view.View>(R.id.submitBtn).setOnClickListener {
            Toast.makeText(this, "Report submitted! Authorities notified.", Toast.LENGTH_LONG).show()
            finish()
        }
        findViewById<android.view.View>(R.id.aiHelpBtn).setOnClickListener {
            startActivity(android.content.Intent(this, AiChatActivity::class.java))
        }
    }
}
