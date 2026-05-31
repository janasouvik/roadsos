import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Bell, Hospital, Ambulance, Shield, Truck, Users, Droplet, Phone, ArrowRight, Wifi, Globe, BadgeCheck, Smartphone, Crosshair, Lock, ShieldCheck, Zap } from "lucide-react";
import { Section, SectionHeading, FadeUp } from "@/components/Section";
import { GlassCard } from "@/components/GlassCard";
import { PhoneMockup } from "@/components/PhoneMockup";
import { SafetyBannerCTA } from "@/components/SafetyBannerCTA";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — ROADSOS" },
      { name: "description", content: "All the tools you need in an emergency. Real-time location, instant alerts, verified services, and more." },
      { property: "og:title", content: "ROADSOS Features" },
      { property: "og:description", content: "Smart features for smarter safety." },
    ],
  }),
  component: Features,
});

const coreFeatures = [
  { Icon: MapPin, title: "Real-time Location Based Services", desc: "Get nearest emergency services based on your live location.", color: "#22c55e" },
  { Icon: Bell, title: "Instant Alerts", desc: "Send SOS alerts and notify your emergency contacts instantly.", color: "#2563ff" },
  { Icon: Hospital, title: "Nearby Hospitals & Trauma Centers", desc: "Find nearest hospitals and trauma care centers with one tap.", color: "#ff1e2d" },
  { Icon: Ambulance, title: "Ambulance Services", desc: "Locate and connect with nearest ambulance services quickly.", color: "#2563ff" },
  { Icon: Shield, title: "Police Stations Nearby", desc: "Find nearest police stations for immediate assistance.", color: "#2563ff" },
  { Icon: Truck, title: "Towing & Vehicle Rescue", desc: "Quickly find towing services and vehicle rescue providers.", color: "#22c55e" },
  { Icon: Users, title: "Rescue Teams", desc: "Connect with trained rescue teams for fast emergency response.", color: "#f97316" },
  { Icon: Globe, title: "Puncture Shops & Mechanics", desc: "Find nearby puncture shops, garages and mechanics.", color: "#9333ea" },
  { Icon: Droplet, title: "Blood Banks", desc: "Locate nearest blood banks and donation centers.", color: "#ff1e2d" },
  { Icon: Phone, title: "Emergency Contacts", desc: "Access important emergency contacts globally.", color: "#9333ea" },
];

const smart = [
  { Icon: Wifi, title: "Works Offline", desc: "Access important services and contacts even without internet.", color: "#22c55e" },
  { Icon: Crosshair, title: "Accurate & Reliable Data", desc: "We ensure accurate, up-to-date information at all times.", color: "#2563ff" },
  { Icon: Globe, title: "Global Coverage", desc: "Emergency services and contacts available across countries.", color: "#9333ea" },
  { Icon: Smartphone, title: "Easy to Use", desc: "Simple interface designed for quick access in critical moments.", color: "#2563ff" },
  { Icon: BadgeCheck, title: "Verified Services", desc: "All service providers are verified for your safety.", color: "#f97316" },
  { Icon: Lock, title: "Privacy & Security", desc: "Your data is encrypted and always protected.", color: "#ff1e2d" },
];

const stats = [
  { Icon: Users, value: "10K+", label: "Users Worldwide", color: "#ff1e2d" },
  { Icon: MapPin, value: "50K+", label: "Services Listed", color: "#2563ff" },
  { Icon: Zap, value: "90%", label: "Faster Response", color: "#22c55e" },
  { Icon: ShieldCheck, value: "99.9%", label: "Uptime & Reliable", color: "#f97316" },
];

function Features() {
  return (
    <>
      <section className="relative pt-10 lg:pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-10 grid lg:grid-cols-2 gap-10 items-center">
          <FadeUp>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-red/15 text-brand-red border border-brand-red/30">
              Powerful Features
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              All the Tools You Need in an <span className="gradient-text-red">Emergency</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-lg">
              ROADSOS is packed with essential features to help you find the right help, faster. Built for every road emergency, every time.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { Icon: ShieldCheck, t: "Reliable", d: "Accurate and trusted service information", c: "#22c55e" },
                { Icon: Zap, t: "Fast", d: "Get help within seconds", c: "#2563ff" },
                { Icon: Lock, t: "Secure", d: "Your data and safety are our priority", c: "#9333ea" },
              ].map((b) => (
                <div key={b.t} className="rounded-2xl p-3 bg-white/[0.02] border border-border/60">
                  <div className="icon-tile h-9 w-9 mb-2" style={{ color: b.c }}><b.Icon className="h-4 w-4" /></div>
                  <div className="text-sm font-semibold">{b.t}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{b.d}</div>
                </div>
              ))}
            </div>
          </FadeUp>
          <div className="flex justify-center"><PhoneMockup /></div>
        </div>
      </section>

      <Section>
        <SectionHeading eyebrow="What Makes ROADSOS Special" title="Our Core Features" />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {coreFeatures.map((f) => (
            <GlassCard key={f.title} className="text-center">
              <div className="mx-auto icon-tile h-14 w-14 mb-3" style={{ color: f.color }}><f.Icon className="h-6 w-6" /></div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-xs text-muted-foreground mt-2">{f.desc}</p>
              <button className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: f.color }}>
                Learn More <ArrowRight className="h-3 w-3" />
              </button>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <GlassCard hover={false} className="p-8 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl" />
          <div className="grid lg:grid-cols-[300px_1fr] gap-8 relative">
            <div>
              <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-blue/15 text-brand-blue">Built for your safety</span>
              <h3 className="text-3xl font-bold leading-tight mt-3">Smart Features for Smarter Safety</h3>
              <p className="mt-4 text-sm text-muted-foreground">ROADSOS combines technology and real-time data to provide the fastest help when you need it most.</p>
              <div className="mt-6 relative h-32">
                <div className="absolute inset-0 ambient-grid opacity-50" />
                <ShieldCheck className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 text-brand-blue opacity-70" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {smart.map((f) => (
                <div key={f.title} className="flex gap-3">
                  <div className="icon-tile h-11 w-11 shrink-0" style={{ color: f.color }}><f.Icon className="h-5 w-5" /></div>
                  <div>
                    <div className="font-semibold text-sm">{f.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </Section>

      <Section className="!pt-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <GlassCard key={s.label} className="flex items-center gap-4">
              <div className="icon-tile h-12 w-12" style={{ color: s.color }}><s.Icon className="h-5 w-5" /></div>
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </GlassCard>
          ))}
        </div>
        <SafetyBannerCTA caption="Quick Help, Just One Tap Away" />
      </Section>
    </>
  );
}
