package com.roadguardian.app.adapter

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.card.MaterialCardView
import com.roadguardian.app.R
import com.roadguardian.app.model.Incident

class IncidentAdapter(private val incidents: List<Incident>) :
    RecyclerView.Adapter<IncidentAdapter.IncidentViewHolder>() {

    inner class IncidentViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val card: MaterialCardView = view.findViewById(R.id.incidentCard)
        val typeText: TextView = view.findViewById(R.id.incidentType)
        val locationText: TextView = view.findViewById(R.id.incidentLocation)
        val timeText: TextView = view.findViewById(R.id.incidentTime)
        val severityBadge: TextView = view.findViewById(R.id.incidentSeverity)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): IncidentViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_incident, parent, false)
        return IncidentViewHolder(view)
    }

    override fun onBindViewHolder(holder: IncidentViewHolder, position: Int) {
        val incident = incidents[position]
        holder.typeText.text = incident.type
        holder.locationText.text = incident.location
        holder.timeText.text = incident.time
        holder.severityBadge.text = incident.severity
        try {
            holder.severityBadge.setTextColor(Color.parseColor(incident.severityColor))
        } catch (e: Exception) { /* ignore */ }
    }

    override fun getItemCount() = incidents.size
}
