import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Play, Hospital, Ambulance, Shield, Truck, Users, Phone, MapPin, Zap, Wifi, Globe, ChevronRight } from "lucide-react";
import heroImg from "@/assets/hero-accident-night.jpg";
import { Section, SectionHeading, FadeUp } from "@/components/Section";
import { GlassCard } from "@/components/GlassCard";
import { EmergencyServicesCard } from "@/components/EmergencyServicesCard";
import { FloatingMap } from "@/components/FloatingMap";
import { QuickActionsBar } from "@/components/QuickActionsBar";
import { SafetyBannerCTA } from "@/components/SafetyBannerCTA";
import { fadeUp } from "@/lib/motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ROADSOS — Emergency Help Within Seconds" },
      { name: "description", content: "Locate nearby hospitals, ambulances, rescue teams, police stations and essential services instantly during road accidents." },
      { property: "og:title", content: "ROADSOS — Emergency Help Within Seconds" },
      { property: "og:description", content: "Connecting you to the nearest emergency services. Fast, reliable, always near you." },
    ],
  }),
  component: Home,
});

const services = [
  { Icon: Hospital, label: "Hospitals", desc: "Locate nearest trauma centers and hospitals instantly.", color: "#ff1e2d" },
  { Icon: Ambulance, label: "Ambulances", desc: "Get ambulance services near you in just a few taps.", color: "#2563ff" },
  { Icon: Shield, label: "Police Stations", desc: "Find nearby police stations for immediate assistance.", color: "#2563ff" },
  { Icon: Truck, label: "Towing Services", desc: "Locate towing services, puncture shops and mechanics.", color: "#22c55e" },
  { Icon: Users, label: "Rescue Teams", desc: "Connect with vehicle rescue teams in your area.", color: "#f97316" },
  { Icon: Phone, label: "Emergency Contacts", desc: "Access important emergency contacts globally.", color: "#9333ea" },
];

const why = [
  { Icon: MapPin, title: "Real-time Location Based Services", desc: "Get the nearest emergency services based on your real-time location.", color: "#ff1e2d" },
  { Icon: Zap, title: "Fast & Reliable", desc: "Quick access to critical services when every second matters.", color: "#2563ff" },
  { Icon: Wifi, title: "Works Offline", desc: "Access important contacts and services even without an internet connection.", color: "#22c55e" },
  { Icon: Globe, title: "Global Coverage", desc: "Reliable emergency assistance across countries.", color: "#9333ea" },
];

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative pt-10 lg:pt-16 pb-10 overflow-hidden">
        <div className="absolute inset-0 ambient-grid opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-10 items-center">
            <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
              <FadeUp>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-red/15 text-brand-red border border-brand-red/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />
                  Emergency Assistance, Anytime Anywhere
                </span>
              </FadeUp>
              <motion.h1 variants={fadeUp} className="mt-5 text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                Emergency Help <br className="hidden sm:block" />
                Within <span className="gradient-text-red">Seconds</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-5 text-base lg:text-lg text-muted-foreground max-w-xl">
                Locate nearby hospitals, ambulances, rescue teams, police stations and essential services instantly during road accidents.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3">
                <button className="btn-emergency h-14 px-7 rounded-full font-semibold inline-flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" /> Find Emergency Services
                </button>
                <button className="h-14 px-7 rounded-full font-semibold btn-ghost-glass inline-flex items-center justify-center gap-2">
                  Learn More
                  <span className="h-7 w-7 rounded-full btn-emergency flex items-center justify-center">
                    <Play className="h-3 w-3 ml-0.5" fill="currentColor" />
                  </span>
                </button>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["#ff1e2d", "#2563ff", "#22c55e", "#f97316"].map((c, i) => (
                    <div key={i} className="h-9 w-9 rounded-full border-2 border-background flex items-center justify-center text-[11px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${c}, ${c}cc)` }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Trusted by <span className="font-semibold text-foreground">10,000+</span> users worldwide
                </div>
              </motion.div>
            </motion.div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative rounded-3xl overflow-hidden border border-border/60 aspect-[4/3] lg:aspect-[5/6]"
              >
                <img src={heroImg} alt="Emergency response scene at night" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-background/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </motion.div>
              <div className="hidden lg:block absolute -right-4 top-10 z-10">
                <EmergencyServicesCard />
              </div>
            </div>
          </div>

          {/* mobile EmergencyServicesCard */}
          <div className="lg:hidden mt-8 flex justify-center">
            <EmergencyServicesCard />
          </div>
        </div>
      </section>

      {/* QUICK ACCESS SERVICES */}
      <Section>
        <SectionHeading
          eyebrow={<><Zap className="h-3 w-3" /> All Services at Your Fingertips</>}
          title="Quick Access to Essential Services"
        />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {services.map((s) => (
            <GlassCard key={s.label} className="flex flex-col">
              <div className="icon-tile h-14 w-14 mb-4" style={{ color: s.color }}>
                <s.Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{s.label}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 mb-4">{s.desc}</p>
              <button className="mt-auto inline-flex items-center gap-1 text-xs font-semibold" style={{ color: s.color }}>
                Find Now <ArrowRight className="h-3 w-3" />
              </button>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* MAP + WHY */}
      <Section className="!pt-0">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
          <FadeUp>
            <FloatingMap />
          </FadeUp>
          <FadeUp>
            <GlassCard hover={false} className="h-full">
              <h3 className="text-2xl font-bold">
                Why <span className="text-foreground">ROAD</span><span className="gradient-text-red">SOS</span>?
              </h3>
              <div className="mt-5 space-y-3">
                {why.map((w) => (
                  <div key={w.title} className="rounded-2xl p-4 border border-border/60 bg-white/[0.02] flex items-start gap-3 hover:bg-white/[0.05] transition-colors cursor-pointer">
                    <div className="icon-tile h-12 w-12 shrink-0" style={{ color: w.color }}>
                      <w.Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{w.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{w.desc}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </GlassCard>
          </FadeUp>
        </div>
      </Section>

      {/* QUICK ACTIONS + CTA */}
      <Section className="!pt-0">
        <FadeUp><QuickActionsBar /></FadeUp>
        <SafetyBannerCTA caption="Quick Help, Just One Tap Away" />
      </Section>
    </>
  );
}
