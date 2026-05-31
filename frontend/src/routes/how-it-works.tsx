import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Zap, Clock, ShieldCheck, MapPin, Search, Siren, ClipboardCheck, Bell, Globe, BadgeCheck, Wifi, Lock, Car, Wrench, CircleDot, Compass, ShieldAlert } from "lucide-react";
import { Section, SectionHeading, FadeUp } from "@/components/Section";
import { GlassCard } from "@/components/GlassCard";
import { PhoneMockup } from "@/components/PhoneMockup";
import { SafetyBannerCTA } from "@/components/SafetyBannerCTA";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — ROADSOS" },
      { name: "description", content: "Get help in 4 easy steps: share location, find nearby services, connect instantly, and stay safe." },
      { property: "og:title", content: "How ROADSOS Works" },
      { property: "og:description", content: "Connects you to emergency services in just a few taps." },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  { Icon: MapPin, title: "Share Your Location", desc: "Allow location access or share your location manually to help us find you.", color: "#2563ff" },
  { Icon: Search, title: "Find Nearby Services", desc: "We instantly search and show nearest hospitals, ambulances, police stations and more.", color: "#22c55e" },
  { Icon: Siren, title: "Connect Instantly", desc: "Contact the selected service directly with one tap or let us notify on your behalf.", color: "#ff1e2d" },
  { Icon: ClipboardCheck, title: "Get Help & Stay Safe", desc: "Help is on the way! Stay calm and follow instructions until assistance arrives.", color: "#22c55e" },
];

const trustFeats = [
  { Icon: MapPin, title: "Real-time Location", desc: "Accurate live location tracking to connect you with nearest services.", color: "#ff1e2d" },
  { Icon: Bell, title: "Instant Alerts", desc: "Quickly alert emergency services and your saved contacts.", color: "#2563ff" },
  { Icon: Globe, title: "Wide Coverage", desc: "Access a wide network of emergency services across cities and regions.", color: "#22c55e" },
  { Icon: BadgeCheck, title: "Verified Services", desc: "We list verified and trusted service providers for your safety.", color: "#9333ea" },
  { Icon: Wifi, title: "Works Offline", desc: "Important data is available offline to help you even without internet.", color: "#f97316" },
  { Icon: Lock, title: "Secure & Private", desc: "Your data is encrypted and kept private. Your safety is our priority.", color: "#22c55e" },
];

const whenToUse = [
  { Icon: Car, title: "Road Accidents", desc: "Get immediate help in case of any road accident.", color: "#ff1e2d" },
  { Icon: Wrench, title: "Vehicle Breakdown", desc: "Find towing services and nearby mechanics instantly.", color: "#2563ff" },
  { Icon: CircleDot, title: "Flat Tyre / Puncture", desc: "Locate puncture shops near your location.", color: "#22c55e" },
  { Icon: Compass, title: "Lost or Stranded", desc: "Find help if you're lost or stranded in unfamiliar areas.", color: "#f97316" },
  { Icon: ShieldAlert, title: "Any Emergency", desc: "Police, ambulance, hospital — anytime you need.", color: "#9333ea" },
];

function HowItWorks() {
  return (
    <>
      <section className="relative pt-10 lg:pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-10 grid lg:grid-cols-2 gap-10 items-center">
          <FadeUp>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              How <span className="text-foreground">ROAD</span><span className="gradient-text-red">SOS</span> Works
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-lg">
              ROADSOS connects you to the nearest emergency services in just a few taps. Fast, reliable and always there when you need it the most.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { Icon: Zap, label: "Fast Response", color: "#ff1e2d" },
                { Icon: Clock, label: "Real-time Services", color: "#22c55e" },
                { Icon: ShieldCheck, label: "Reliable & Secure", color: "#2563ff" },
              ].map((b) => (
                <div key={b.label} className="glass-card rounded-2xl px-4 h-12 inline-flex items-center gap-2.5">
                  <span className="icon-tile h-8 w-8" style={{ color: b.color }}><b.Icon className="h-4 w-4" /></span>
                  <span className="text-sm font-semibold">{b.label}</span>
                </div>
              ))}
            </div>
          </FadeUp>
          <div className="relative flex justify-center">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* STEPS */}
      <Section>
        <SectionHeading
          eyebrow="Simple Steps, Life-Saving Impact"
          title="Get Help in 4 Easy Steps"
        />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {steps.map((s, i) => (
            <GlassCard key={s.title} className="text-center pt-12 relative" glow={i % 2 === 0 ? "red" : "blue"}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-9 w-9 rounded-full btn-emergency flex items-center justify-center text-sm font-bold">{i + 1}</div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-14 -right-3 h-px w-6 border-t-2 border-dashed border-border" />
              )}
              <div className="relative mx-auto h-24 w-24 mb-4 rounded-full flex items-center justify-center" style={{ background: `${s.color}1A`, color: s.color }}>
                <div className="absolute inset-0 rounded-full ambient-grid opacity-40" />
                <s.Icon className="h-9 w-9 relative" />
              </div>
              <h3 className="font-bold">{s.title}</h3>
              <p className="text-xs text-muted-foreground mt-2">{s.desc}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* TRUSTED FEATURES */}
      <Section className="!pt-0">
        <GlassCard hover={false} className="p-8">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-red mb-3">
                <Zap className="h-3 w-3" /> Always Working for You
              </div>
              <h3 className="text-3xl font-bold leading-tight">Trusted. Fast. Always by Your Side.</h3>
              <p className="mt-4 text-sm text-muted-foreground">
                ROADSOS is built to reduce response time and improve access to critical care during road emergencies.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trustFeats.map((f) => (
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

      {/* WHEN TO USE */}
      <Section className="!pt-0">
        <SectionHeading title={<>When to Use <span className="text-foreground">ROAD</span><span className="gradient-text-red">SOS</span>?</>} subtitle="We're here for every road emergency situation." />
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {whenToUse.map((w) => (
            <GlassCard key={w.title} className="text-center">
              <div className="mx-auto icon-tile h-16 w-16 mb-3" style={{ color: w.color }}><w.Icon className="h-7 w-7" /></div>
              <div className="font-semibold text-sm">{w.title}</div>
              <div className="text-xs text-muted-foreground mt-1.5">{w.desc}</div>
            </GlassCard>
          ))}
        </div>
        <SafetyBannerCTA caption="Quick Help, Just One Tap Away" />
      </Section>
    </>
  );
}
