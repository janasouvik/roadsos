import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, Users, Ambulance, Heart, Shield, MapPin, Mail } from "lucide-react";
import { Section, SectionHeading, FadeUp } from "@/components/Section";
import { GlassCard } from "@/components/GlassCard";
import { SafetyBannerCTA } from "@/components/SafetyBannerCTA";
import { LinkedinIcon, TwitterIcon } from "@/components/BrandIcons";
import ambulanceCity from "@/assets/ambulance-city.jpg";
import storyRoad from "@/assets/story-road.jpg";
import storyAccident from "@/assets/story-accident.jpg";
import storyOperator from "@/assets/story-operator.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — ROADSOS" },
      { name: "description", content: "ROADSOS is a mission-driven team committed to connecting people with emergency help when it matters most." },
      { property: "og:title", content: "About ROADSOS" },
      { property: "og:description", content: "We're here to save lives." },
    ],
  }),
  component: About,
});

const team = [
  { name: "Arjun Mehta", role: "Founder & CEO", roleColor: "#ff1e2d", bio: "Passionate about technology and making roads safer for everyone." },
  { name: "Neha Sharma", role: "COO", roleColor: "#2563ff", bio: "Ensures smooth operations and strong partnerships across the network." },
  { name: "Rohit Verma", role: "CTO", roleColor: "#22c55e", bio: "Leads technology and innovation to deliver fast and reliable solutions." },
  { name: "Pooja Iyer", role: "Head of Support", roleColor: "#9333ea", bio: "Leads our support team to provide 24/7 assistance with care." },
];

function About() {
  return (
    <>
      <section className="relative pt-10 lg:pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-10 grid lg:grid-cols-2 gap-10 items-center">
          <FadeUp>
            <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-red/15 text-brand-red border border-brand-red/30">
              About ROADSOS
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              We're Here to <span className="gradient-text-red">Save Lives</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-lg">
              ROADSOS is more than just an emergency service platform. We are a mission-driven team committed to connecting you to help when it matters most.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { Icon: ShieldCheck, t: "Our Mission", d: "To reduce response time and save more lives on the road.", c: "#ff1e2d" },
                { Icon: Eye, t: "Our Vision", d: "A safer tomorrow with smarter emergency solutions for everyone.", c: "#2563ff" },
                { Icon: Users, t: "Our Promise", d: "Fast. Reliable. Always there when you need us.", c: "#22c55e" },
              ].map((b) => (
                <div key={b.t}>
                  <div className="icon-tile h-11 w-11 mb-2" style={{ color: b.c }}><b.Icon className="h-5 w-5" /></div>
                  <div className="font-semibold text-sm">{b.t}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{b.d}</div>
                </div>
              ))}
            </div>
          </FadeUp>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative rounded-3xl overflow-hidden border border-border/60 aspect-[16/11]">
            <img src={ambulanceCity} alt="Ambulance city" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <Section className="!pt-0">
        <GlassCard hover={false} className="p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-3xl font-bold">Our Story</h2>
              <div className="w-12 h-0.5 bg-brand-red mt-2 mb-5" />
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>Road accidents and emergencies can happen anytime, anywhere. In those critical moments, finding the right help quickly can make all the difference.</p>
                <p>ROADSOS was built to solve this problem by connecting people to the nearest emergency services with just a few taps.</p>
                <p>From a simple idea to a trusted platform, our journey continues with one goal — to save more lives every single day.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative rounded-2xl overflow-hidden col-span-2 aspect-[16/9]">
                <img src={storyRoad} alt="Mountain road at night" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute bottom-3 left-3 glass-card rounded-2xl px-3 py-2 flex items-center gap-2">
                  <div className="icon-tile h-8 w-8 text-brand-red"><Heart className="h-3.5 w-3.5" /></div>
                  <div className="text-xs">
                    <div className="font-semibold">Helping People</div>
                    <div className="text-muted-foreground">Every Day</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <img src={storyAccident} alt="Road accident" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <img src={storyOperator} alt="Operator" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>
          </div>
        </GlassCard>
      </Section>

      {/* Stats */}
      <Section className="!pt-0">
        <GlassCard hover={false}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { Icon: Users, value: "10K+", label: "Users Served", sub: "Across India", color: "#ff1e2d" },
              { Icon: Shield, value: "50K+", label: "Emergency Requests", sub: "Handled", color: "#2563ff" },
              { Icon: Heart, value: "90%", label: "Faster Response", sub: "Time", color: "#22c55e" },
              { Icon: Ambulance, value: "1000+", label: "Partner Services", sub: "Across Cities", color: "#f97316" },
              { Icon: MapPin, value: "100+", label: "Cities Covered", sub: "And Growing", color: "#9333ea" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="icon-tile h-12 w-12 shrink-0" style={{ color: s.color }}><s.Icon className="h-5 w-5" /></div>
                <div>
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-xs font-medium">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </Section>

      {/* Team */}
      <Section className="!pt-0">
        <SectionHeading eyebrow="The People Behind ROADSOS" title="Meet Our Team" subtitle="A dedicated team of professionals working 24/7 to ensure you get help when you need it most." />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((m) => (
            <GlassCard key={m.name} className="text-center" glow="red">
              <div className="mx-auto relative h-24 w-24 mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br opacity-20 blur-xl" style={{ background: m.roleColor }} />
                <div
                  className="relative h-24 w-24 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${m.roleColor}, ${m.roleColor}88)` }}
                >
                  {m.name.split(" ").map((p) => p[0]).join("")}
                </div>
              </div>
              <div className="font-bold">{m.name}</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: m.roleColor }}>{m.role}</div>
              <p className="text-xs text-muted-foreground mt-2">{m.bio}</p>
              <div className="mt-4 flex justify-center gap-2">
                {[LinkedinIcon, TwitterIcon, Mail].map((I, i) => (
                  <a key={i} href="#" className="h-8 w-8 rounded-lg btn-ghost-glass flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <I className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
        <SafetyBannerCTA />
      </Section>
    </>
  );
}
