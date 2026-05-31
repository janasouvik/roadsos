import { motion } from "framer-motion";
import { MapPin, Hospital, Ambulance, Shield, Users, Truck, Phone } from "lucide-react";

/** Stylized phone mockup with map content – pure CSS/SVG, no external libs. */
export function PhoneMockup({ float = true }: { float?: boolean }) {
  return (
    <motion.div
      animate={float ? { y: [0, -10, 0] } : undefined}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative mx-auto w-[260px] sm:w-[300px] aspect-[9/19] rounded-[2.5rem] p-3 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]"
      style={{ background: "linear-gradient(180deg, #1a1f2e, #0a0e1a)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="absolute left-1/2 -translate-x-1/2 top-2.5 h-5 w-24 rounded-full bg-black z-10" />
      <div className="h-full w-full rounded-[2rem] overflow-hidden relative bg-[#0a1024]">
        <div className="absolute inset-x-0 top-0 px-5 pt-3 flex items-center justify-between text-[10px] text-white/80 z-10">
          <span>9:41</span>
          <span>•••</span>
        </div>

        <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 200 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="phgrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#2a3550" strokeWidth="0.7"/>
            </pattern>
          </defs>
          <rect width="200" height="400" fill="url(#phgrid)" />
          <path d="M 0 180 Q 80 160 100 200 T 200 220" stroke="#2a3550" strokeWidth="10" fill="none" />
          <path d="M 60 0 Q 80 100 120 200 T 160 400" stroke="#2a3550" strokeWidth="8" fill="none" />
          <path d="M 100 200 Q 70 140 50 110" stroke="#2563ff" strokeWidth="2.5" fill="none" strokeDasharray="4 5" />
        </svg>

        <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-full">
          <div className="relative">
            <MapPin className="h-10 w-10 text-brand-red drop-shadow-[0_0_12px_rgba(255,30,45,0.8)]" fill="#ff1e2d" />
          </div>
        </div>

        <div className="absolute left-4 right-4 bottom-4 glass-card rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-tile h-9 w-9 text-brand-red"><Hospital className="h-4 w-4" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">City Care Trauma Center</div>
              <div className="text-[10px] text-muted-foreground">2.4 km away</div>
            </div>
          </div>
          <button className="w-full btn-emergency h-9 rounded-xl text-xs font-semibold">Get Directions</button>
        </div>
      </div>

      {/* Floating mini icons */}
      <FloatingChip className="-left-6 top-12" Icon={Hospital} color="#ff1e2d" delay={0} />
      <FloatingChip className="-left-8 top-32" Icon={Ambulance} color="#2563ff" delay={0.6} />
      <FloatingChip className="-left-4 top-52" Icon={Shield} color="#22c55e" delay={1.2} />
      <FloatingChip className="-right-6 top-20" Icon={Users} color="#f97316" delay={0.3} />
      <FloatingChip className="-right-8 top-40" Icon={Truck} color="#9333ea" delay={0.9} />
      <FloatingChip className="-right-4 top-60" Icon={Phone} color="#ff1e2d" delay={1.5} />
    </motion.div>
  );
}

function FloatingChip({ Icon, color, className, delay }: { Icon: typeof MapPin; color: string; className: string; delay: number }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute h-12 w-12 rounded-2xl glass-card flex items-center justify-center ${className}`}
      style={{ color, boxShadow: `0 8px 30px -8px ${color}80` }}
    >
      <Icon className="h-5 w-5" />
    </motion.div>
  );
}
