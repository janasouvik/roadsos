package com.roadguardian.app.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.roadguardian.app.databinding.ActivityEmergencyContactsBinding
import android.content.Intent
import android.net.Uri
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat

class EmergencyContactsActivity : AppCompatActivity() {
    private lateinit var binding: ActivityEmergencyContactsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEmergencyContactsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.backBtn.setOnClickListener { finish() }

        binding.callPolice.setOnClickListener { call("100") }
        binding.callAmbulance.setOnClickListener { call("108") }
        binding.callFire.setOnClickListener { call("101") }
        binding.callRoad.setOnClickListener { call("1033") }
        binding.callEmergency.setOnClickListener { call("112") }
    }

    private fun call(number: String) {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
            startActivity(Intent(Intent.ACTION_CALL, Uri.parse("tel:$number")))
        } else {
            startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$number")))
        }
    }
}
