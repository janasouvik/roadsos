import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  id,
  container = true,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  container?: boolean;
}) {
  return (
    <motion.section
      id={id}
      variants={stagger(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={cn("py-16 md:py-24", className)}
    >
      <div className={container ? "max-w-7xl mx-auto px-4 md:px-6 lg:px-10" : ""}>
        {children}
      </div>
    </motion.section>
  );
}

export function FadeUp({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "text-center mx-auto" : "text-left", "max-w-3xl", className)}>
      {eyebrow && (
        <FadeUp>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-red mb-3">
            {eyebrow}
          </div>
        </FadeUp>
      )}
      <FadeUp>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
          {title}
        </h2>
      </FadeUp>
      {subtitle && (
        <FadeUp>
          <p className="mt-4 text-base text-muted-foreground">{subtitle}</p>
        </FadeUp>
      )}
    </div>
  );
}
