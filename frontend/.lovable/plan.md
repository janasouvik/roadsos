# ROADSOS — Frontend Build Plan

A pixel-faithful, cinematic dark-themed emergency-response marketing site matching the 8 reference screenshots. Frontend only — no backend, no auth logic (login/signup are visual only).

## Stack note
The project is TanStack Start (TanStack Router), not React Router DOM. I'll use TanStack Router (`<Link>` from `@tanstack/react-router`) — functionally equivalent and required by this template. Everything else matches your spec: React + Vite + TS + Tailwind + Framer Motion + Lucide + clsx + tailwind-merge.

## Design system (src/styles.css)
- Tokens (oklch) for: background `#020617`, card glass, border, red `#ff1e2d`, blue `#2563ff`, green `#22c55e`, purple `#9333ea`, orange `#f97316`, plus light-mode equivalents.
- Body background: layered radial gradients (blue top-left, red top-right) over `#020617`.
- Inter font via Google Fonts link in `__root.tsx`.
- Reusable utility classes: `.glass-card`, `.glow-red`, `.glow-blue`, `.gradient-text-red`, `.btn-emergency`.
- Framer Motion variants module for fade-up, stagger, float.
- Full light-mode palette with smooth `transition-colors` toggle.

## Routes (each its own file with head() metadata)
```
src/routes/
  __root.tsx          (Navbar + Outlet + Footer + ThemeProvider)
  index.tsx           Home
  services.tsx        Services
  how-it-works.tsx    How It Works
  features.tsx        Features
  about.tsx           About Us
  contact.tsx         Contact
  login.tsx           Login (visual only)
  signup.tsx          Signup (visual only)
```
Auth pages render without the standard navbar footer chrome via a layout flag or a dedicated `AuthLayout` wrapper inside each.

## Reusable components (src/components/)
- `Navbar.tsx` — sticky glass nav, shield logo + "ROADSOS" + tagline, center links with red active underline, right side: ThemeToggle + Login + Sign Up (no SOS button as requested). Mobile hamburger with slide-in drawer.
- `Footer.tsx` — logo, links, social icons, copyright, red safety banner variant.
- `ThemeToggle.tsx` — sun/moon, persists to localStorage, toggles `.dark` on `<html>`. SSR-safe via `ScriptOnce` to avoid flash.
- `SectionHeading.tsx` — small red eyebrow + large heading + optional subtitle.
- `GlassCard.tsx` — base glass container with optional glow color prop.
- `FeatureCard.tsx`, `ServiceCard.tsx`, `StatsCard.tsx`, `StepCard.tsx`, `TeamCard.tsx`.
- `AnimatedButton.tsx` — primary (red glossy gradient) + secondary (outlined glass) variants, scale-on-hover.
- `FloatingMap.tsx` — stylized SVG dark-map with route line, animated pulse markers, legend panel. Pure SVG/CSS, no map lib.
- `EmergencyServicesCard.tsx` — the hero floating card (Hospital/Ambulance/Police/Rescue list).
- `QuickActionsBar.tsx` — 5 colored pill actions.
- `SafetyBannerCTA.tsx` — bottom red glowing CTA.
- `FAQAccordion.tsx` — radix-free simple accordion with framer-motion.
- `AuthLayout.tsx` — split-screen wrapper for login/signup.
- `Section.tsx` — wrapper applying max-w-7xl + responsive padding + scroll-triggered fade-up.

## Page composition (matches references)
- **Home**: Hero (heading + CTAs + EmergencyServicesCard + trusted users) → Quick Access 6-card grid → Map + "Why ROADSOS?" split → QuickActionsBar → SafetyBannerCTA.
- **Services**: Hero (title + ambulance hero image) → Sidebar (categories) + Nearby list + FloatingMap → All services 5×2 grid → Why use → CTA.
- **How It Works**: Hero (mobile mockup + ambulance) → 4-step cards with dotted connectors → Trusted features grid → "When to Use" 5-card row → CTA.
- **Features**: Hero (mockup + floating service chips) → 10-card core features grid → Smart safety section + 6 features → Stats row → CTA.
- **About**: Hero (Save Lives + ambulance) → Mission/Vision/Promise → Story collage → Stats row → Team grid (4 members) → CTA.
- **Contact**: Hero + emergency card → 2-col Form + Info → FAQ accordion + Location card.
- **Login / Signup**: Split-screen, image left with bullets, glass form right with Google/Apple buttons.

## Imagery
Hero/scene images via `imagegen` saved to `src/assets/`:
- `hero-accident-night.jpg` (home hero)
- `ambulance-city.jpg` (services/about/contact heroes)
- `ambulance-mobile-mockup.jpg` (how-it-works/features)
- `accident-collage-1.jpg`, `accident-collage-2.jpg`, `911-operator.jpg` (about story)
- `team-1..4.jpg` (about team)
- `ambulance-night-auth.jpg` (login/signup)

Logo as inline SVG component (red shield + cross). All icons via Lucide.

## Animations
- Page-level fade-up stagger via Framer Motion `whileInView`.
- Floating hero cards: subtle Y oscillation `animate={{y:[0,-8,0]}}`.
- Hover: `scale: 1.02` + glow box-shadow transition.
- Navbar reveal on mount, mobile drawer slide-in.
- Map pulse markers via CSS keyframes.

## Responsiveness
Mobile-first. Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3/4/5/6`. Hero stacks vertically on mobile, CTAs full-width stacked. Auth split → single column under `lg`. Containers `max-w-7xl mx-auto px-4 md:px-6 lg:px-10`. Responsive headings `text-4xl md:text-5xl lg:text-7xl`.

## Dependencies to add
`framer-motion`, `clsx`, `tailwind-merge` (lucide-react already present in templates).

## Out of scope
No Supabase/auth wiring, no form submission backend, no real maps API — all visual fidelity only, exactly as requested.
