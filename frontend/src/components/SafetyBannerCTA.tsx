import { Phone, ShieldPlus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function SafetyBannerCTA({ caption }: { caption?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border border-brand-red/30 p-6 sm:p-8 mt-6"
      style={{
        background: "linear-gradient(110deg, oklch(0.25 0.15 25 / 0.6), oklch(0.18 0.06 265 / 0.6))",
      }}
    >
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-red/20 blur-3xl" />
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30"
        style={{ backgroundImage: "radial-gradient(circle, #ff1e2d 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      />

      <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
        <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-[#ff1e2d] to-[#a30b15] flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(255,30,45,0.6)]">
          <ShieldPlus className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold">Your Safety, Our Priority</h3>
          <p className="text-sm text-muted-foreground mt-1">
            ROADSOS is committed to saving lives and reducing the impact of road accidents.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1">
          <button className="btn-emergency h-12 px-6 rounded-full text-sm font-semibold inline-flex items-center gap-2">
            <Phone className="h-4 w-4" /> SOS Now <ArrowRight className="h-4 w-4" />
          </button>
          {caption && <span className="text-xs text-muted-foreground">{caption}</span>}
        </div>
      </div>
    </motion.div>
  );
}
