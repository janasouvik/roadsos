import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { ShieldCheck } from "lucide-react";
import ambulanceAuth from "@/assets/ambulance-auth.jpg";
import { motion } from "framer-motion";

export function AuthLayout({
  side,
  children,
}: {
  side: { title: ReactNode; description: string; bullets: { Icon: any; title: string; text: string; color: string }[] };
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 h-[72px] flex items-center justify-between">
          <Link to="/"><Logo withTagline /></Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-10 py-10">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Side panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-3xl p-7 sm:p-10 relative overflow-hidden order-2 lg:order-1"
          >
            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-brand-red/20 blur-3xl" />
            <div className="absolute top-0 right-0 grid grid-cols-6 gap-1 p-3 opacity-40">
              {Array.from({ length: 18 }).map((_, i) => (
                <span key={i} className="h-1 w-1 rounded-full bg-brand-red" />
              ))}
            </div>
            <h1 className="relative text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
              {side.title}
            </h1>
            <p className="relative mt-4 text-muted-foreground max-w-md">{side.description}</p>

            <div className="relative mt-8 space-y-4">
              {side.bullets.map((b) => (
                <div key={b.title} className="flex gap-3 items-start">
                  <div className="icon-tile h-11 w-11 shrink-0" style={{ color: b.color }}>
                    <b.Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{b.title}</div>
                    <div className="text-xs text-muted-foreground">{b.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mt-8 -mx-2">
              <img src={ambulanceAuth} alt="Ambulance" className="rounded-2xl w-full h-auto object-cover aspect-[5/3]" />
            </div>

            <div className="relative mt-6 glass-card rounded-2xl p-4 flex items-start gap-3">
              <div className="icon-tile h-10 w-10 text-brand-red shrink-0"><ShieldCheck className="h-4 w-4" /></div>
              <div className="text-xs">
                <div className="font-semibold">Your safety, our priority.</div>
                <div className="text-muted-foreground">We use advanced security to keep your data safe and secure.</div>
              </div>
            </div>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card rounded-3xl p-7 sm:p-10 order-1 lg:order-2"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
