import { Shield, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, withText = true, withTagline = false }: { className?: string; withText?: boolean; withTagline?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-brand-red/40 blur-xl" />
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff1e2d] to-[#a30b15] shadow-[0_4px_20px_-4px_oklch(0.62_0.24_27/0.7)]">
          <Shield className="h-5 w-5 text-white" strokeWidth={2.5} fill="white" fillOpacity={0.15} />
          <Plus className="absolute h-3 w-3 text-white" strokeWidth={3.5} />
        </div>
      </div>
      {withText && (
        <div className="leading-none">
          <div className="font-extrabold text-lg tracking-tight">
            <span className="text-foreground">ROAD</span>
            <span className="gradient-text-red">SOS</span>
          </div>
          {withTagline && (
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
              Help. Locate. Save.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
