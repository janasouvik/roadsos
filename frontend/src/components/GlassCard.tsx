import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";

export function GlassCard({
  children,
  className,
  hover = true,
  glow,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "red" | "blue" | "green" | "purple" | "orange";
}) {
  const glowMap: Record<string, string> = {
    red: "hover:shadow-[0_20px_60px_-20px_oklch(0.62_0.24_27/0.5)]",
    blue: "hover:shadow-[0_20px_60px_-20px_oklch(0.6_0.22_260/0.5)]",
    green: "hover:shadow-[0_20px_60px_-20px_oklch(0.7_0.18_150/0.5)]",
    purple: "hover:shadow-[0_20px_60px_-20px_oklch(0.6_0.24_295/0.5)]",
    orange: "hover:shadow-[0_20px_60px_-20px_oklch(0.74_0.18_55/0.5)]",
  };

  return (
    <motion.div
      variants={fadeUp}
      whileHover={hover ? { y: -4, scale: 1.015 } : undefined}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass-card rounded-3xl p-6 transition-all duration-300",
        glow && glowMap[glow],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
