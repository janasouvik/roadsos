import { motion } from "framer-motion";
import { Hospital, Ambulance, Shield, Users, ChevronRight } from "lucide-react";

const items = [
  { icon: Ambulance, label: "Ambulance", sub: "3 mins away", color: "text-brand-red", bg: "bg-brand-red/15" },
  { icon: Shield, label: "Police Station", sub: "1.8 km away", color: "text-brand-blue", bg: "bg-brand-blue/15" },
  { icon: Users, label: "Rescue Team", sub: "4 mins away", color: "text-brand-green", bg: "bg-brand-green/15" },
];

export function EmergencyServicesCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-3xl p-5 w-full max-w-sm relative"
      style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset" }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-3 -right-3 h-24 w-24 rounded-full bg-brand-red/20 blur-2xl"
      />

      <div className="rounded-2xl p-4 bg-white/[0.03] border border-border/60 mb-3">
        <div className="flex items-center gap-3">
          <div className="icon-tile text-brand-red h-12 w-12">
            <Hospital className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Nearest Hospital</div>
            <div className="font-semibold truncate">City Care Trauma Center</div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-muted-foreground">2.4 km away</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-blue/20 text-brand-blue">Open 24/7</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.04] transition-colors cursor-pointer">
            <div className={`icon-tile h-11 w-11 ${it.color}`}>
              <it.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{it.label}</div>
              <div className="text-xs text-muted-foreground">{it.sub}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-2xl p-3 flex items-center gap-3 bg-white/[0.03] border border-border/60">
        <div className="relative h-11 w-11 rounded-full border-2 border-brand-red flex items-center justify-center text-[10px] font-bold text-brand-red">
          24/7
          <span className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-brand-red" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">We are always here</span>
            <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse" />
          </div>
          <div className="text-xs text-muted-foreground">For your safety and support</div>
        </div>
      </div>
    </motion.div>
  );
}
