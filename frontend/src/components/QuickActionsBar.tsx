import { Phone, Send, UserPlus, Droplet, Flashlight, Zap } from "lucide-react";
import { GlassCard } from "./GlassCard";

const actions = [
  { Icon: Phone, label: "Call Ambulance", color: "#ff1e2d" },
  { Icon: Send, label: "Share Location", color: "#2563ff" },
  { Icon: UserPlus, label: "Notify Contact", color: "#22c55e" },
  { Icon: Droplet, label: "Find Blood Bank", color: "#f97316" },
  { Icon: Flashlight, label: "SOS Flashlight", color: "#9333ea" },
];

export function QuickActionsBar() {
  return (
    <GlassCard hover={false} className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-brand-red" />
        <span className="font-semibold text-sm">Quick Actions</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-border/60 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-sm font-semibold"
            style={{ color: a.color }}
          >
            <span className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: a.color + "25" }}>
              <a.Icon className="h-4 w-4" />
            </span>
            {a.label}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
