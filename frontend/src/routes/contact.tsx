import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Headphones, Shield, Zap, Phone, Mail, MapPin, Globe, Send, User, Lock, ArrowUpRight } from "lucide-react";
import ambulanceCity from "@/assets/ambulance-city.jpg";
import { Section, FadeUp } from "@/components/Section";
import { GlassCard } from "@/components/GlassCard";
import { FAQAccordion } from "@/components/FAQAccordion";
import { SafetyBannerCTA } from "@/components/SafetyBannerCTA";
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "@/components/BrandIcons";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ROADSOS" },
      { name: "description", content: "Have a question, feedback, or need assistance? Our team is ready to help you, 24/7." },
      { property: "og:title", content: "Contact ROADSOS" },
      { property: "og:description", content: "We're here to help you anytime." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <section className="relative pt-10 lg:pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-10 grid lg:grid-cols-2 gap-10 items-center">
          <FadeUp>
            <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-red/15 text-brand-red border border-brand-red/30">Get in Touch</span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              We're Here to <br className="hidden sm:block" />
              <span className="gradient-text-red">Help</span> You Anytime
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-lg">
              Have a question, feedback, or need assistance? Our team is ready to help you.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { Icon: Headphones, t: "24/7 Support", d: "We're available round the clock", c: "#ff1e2d" },
                { Icon: Shield, t: "Trusted Service", d: "Your safety is our priority", c: "#2563ff" },
                { Icon: Zap, t: "Quick Response", d: "We respond as quickly as possible", c: "#22c55e" },
              ].map((b) => (
                <div key={b.t}>
                  <div className="icon-tile h-10 w-10 mb-2" style={{ color: b.c }}><b.Icon className="h-4 w-4" /></div>
                  <div className="font-semibold text-sm">{b.t}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{b.d}</div>
                </div>
              ))}
            </div>
          </FadeUp>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-3xl overflow-hidden border border-border/60 aspect-[16/11]">
            <img src={ambulanceCity} alt="Ambulance" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 glass-card rounded-2xl p-5 max-w-[240px]">
              <div className="font-bold mb-1">In an Emergency?</div>
              <div className="text-xs text-muted-foreground mb-3">Don't wait! Help is just one tap away.</div>
              <button className="w-full btn-emergency h-10 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" /> SOS Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Section className="!pt-0">
        <div className="grid lg:grid-cols-2 gap-6">
          <FadeUp>
            <GlassCard hover={false}>
              <h3 className="text-2xl font-bold">Send Us a Message</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-5">Fill out the form and our team will get back to you shortly.</p>
              <form className="space-y-4">
                <Field label="Full Name" icon={User}><input className="input-glass" placeholder="Enter your full name" /></Field>
                <Field label="Email Address" icon={Mail}><input type="email" className="input-glass" placeholder="Enter your email address" /></Field>
                <Field label="Phone Number" icon={Phone}><input type="tel" className="input-glass" placeholder="Enter your phone number" /></Field>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Subject</label>
                  <select className="input-glass appearance-none cursor-pointer">
                    <option>Select a subject</option>
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Message</label>
                  <textarea className="input-glass min-h-[120px] resize-y" placeholder="Type your message here..." />
                </div>
                <button type="submit" className="w-full btn-emergency h-12 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" /> Send Message
                </button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> Your information is safe and secure with us.
                </div>
              </form>
            </GlassCard>
          </FadeUp>

          <FadeUp>
            <GlassCard hover={false}>
              <h3 className="text-2xl font-bold">Contact Information</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-5">Reach out to us through any of the following channels.</p>
              <div className="space-y-3">
                <InfoRow Icon={Phone} color="#ff1e2d" title="Call Us" main="+91 98765 43210" sub="Available 24/7" />
                <InfoRow Icon={Mail} color="#2563ff" title="Email Us" main="support@roadsos.com" sub="We reply within 24 hours" />
                <InfoRow Icon={MapPin} color="#22c55e" title="Head Office" main="ROADSOS Headquarters" sub="123 Safety Street, Bangalore, Karnataka 560001, India" />
                <InfoRow Icon={Globe} color="#9333ea" title="Website" main="www.roadsos.com" sub="Visit our website for more info" />
                <div className="rounded-2xl p-4 border border-border/60 bg-white/[0.02] flex items-center gap-3">
                  <div className="icon-tile h-11 w-11 text-brand-orange"><Send className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Follow Us</div>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { I: FacebookIcon, c: "#2563ff" },
                      { I: TwitterIcon, c: "#1da1f2" },
                      { I: InstagramIcon, c: "#e1306c" },
                      { I: LinkedinIcon, c: "#0077b5" },
                      { I: YoutubeIcon, c: "#ff0000" },
                    ].map((s, i) => (
                      <a key={i} href="#" className="h-8 w-8 rounded-full flex items-center justify-center text-white" style={{ background: s.c }}>
                        <s.I className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </FadeUp>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="grid lg:grid-cols-2 gap-6">
          <FadeUp>
            <GlassCard hover={false}>
              <h3 className="text-2xl font-bold mb-5">Frequently Asked Questions</h3>
              <FAQAccordion items={[
                { q: "How does ROADSOS work?", a: "ROADSOS uses your real-time location to find the nearest emergency services and connect you with them instantly via one tap." },
                { q: "Is ROADSOS available 24/7?", a: "Yes — our platform and our support team are available round the clock, every day of the year." },
                { q: "Is my data safe with ROADSOS?", a: "Absolutely. All your data is encrypted in transit and at rest. We never share your personal information." },
                { q: "How quickly will help arrive?", a: "Response times depend on your location and the type of service, but we route the closest available provider for the fastest possible help." },
              ]} />
            </GlassCard>
          </FadeUp>
          <FadeUp>
            <GlassCard hover={false}>
              <h3 className="text-2xl font-bold mb-5">Our Location</h3>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#0a1024]">
                <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 400 300" preserveAspectRatio="none">
                  <defs>
                    <pattern id="cgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2a3550" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="400" height="300" fill="url(#cgrid)" />
                  <path d="M 0 160 Q 200 130 400 170" stroke="#3a4670" strokeWidth="6" fill="none"/>
                  <path d="M 100 0 Q 130 150 200 300" stroke="#3a4670" strokeWidth="6" fill="none"/>
                </svg>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                  <MapPin className="h-12 w-12 text-brand-red drop-shadow-[0_0_15px_rgba(255,30,45,0.8)]" fill="#ff1e2d" />
                </div>
                {[
                  { x: 20, y: 40, c: "#2563ff" },
                  { x: 75, y: 30, c: "#22c55e" },
                  { x: 80, y: 70, c: "#22c55e" },
                ].map((p, i) => (
                  <MapPin key={i} className="absolute h-6 w-6 drop-shadow" style={{ left: `${p.x}%`, top: `${p.y}%`, color: p.c }} fill={p.c} />
                ))}
              </div>
              <div className="mt-4 rounded-2xl p-3 flex items-center gap-3 border border-border/60">
                <div className="icon-tile h-10 w-10 text-brand-red"><MapPin className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">ROADSOS Headquarters</div>
                  <div className="text-xs text-muted-foreground">123 Safety Street, Bangalore, Karnataka 560001, India</div>
                </div>
                <button className="px-3 py-1.5 rounded-full btn-ghost-glass text-xs font-semibold inline-flex items-center gap-1">
                  Get Directions <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </GlassCard>
          </FadeUp>
        </div>
        <SafetyBannerCTA />
      </Section>
    </>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <div className="relative">
        {children}
        <Icon className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

function InfoRow({ Icon, color, title, main, sub }: { Icon: any; color: string; title: string; main: string; sub: string }) {
  return (
    <div className="rounded-2xl p-4 border border-border/60 bg-white/[0.02] flex items-start gap-3 hover:bg-white/[0.04] transition-colors">
      <div className="icon-tile h-11 w-11 shrink-0" style={{ color }}><Icon className="h-5 w-5" /></div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-muted-foreground">{title}</div>
        <div className="font-semibold text-sm">{main}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </div>
    </div>
  );
}
