import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Hospital, Ambulance, Shield, Truck, Users, Phone, Droplet, Globe, Plus, Pill, MapPin, ArrowRight, ChevronRight, Map as MapIcon, AlertTriangle, Loader2, X, Send } from "lucide-react";
import ambulanceCity from "@/assets/ambulance-city.jpg";
import { Section, SectionHeading, FadeUp } from "@/components/Section";
import { GlassCard } from "@/components/GlassCard";
import { FloatingMap } from "@/components/FloatingMap";
import { SafetyBannerCTA } from "@/components/SafetyBannerCTA";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { sosApi, SosRequest } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — ROADSOS" },
      { name: "description", content: "Explore a wide range of emergency services: hospitals, ambulances, police stations, towing, rescue teams, blood banks and more." },
      { property: "og:title", content: "ROADSOS Services" },
      { property: "og:description", content: "All the emergency help you need, near you, anytime." },
    ],
  }),
  component: Services,
});

const sidebar = [
  { Icon: Hospital, label: "Hospitals", color: "#ff1e2d", active: true },
  { Icon: Ambulance, label: "Ambulances", color: "#2563ff" },
  { Icon: Shield, label: "Police Stations", color: "#2563ff" },
  { Icon: Truck, label: "Towing Services", color: "#22c55e" },
  { Icon: Users, label: "Rescue Teams", color: "#f97316" },
  { Icon: Globe, label: "Puncture Shops", color: "#9333ea" },
  { Icon: Truck, label: "Showrooms", color: "#2563ff" },
  { Icon: Phone, label: "Emergency Contacts", color: "#9333ea" },
  { Icon: Droplet, label: "Blood Banks", color: "#ff1e2d" },
  { Icon: Pill, label: "Pharmacies", color: "#22c55e" },
];

const nearby = [
  { Icon: Hospital, color: "#ff1e2d", name: "City Care Trauma Center", meta: "2.4 km away", badge: "Open 24/7" },
  { Icon: Ambulance, color: "#2563ff", name: "LifeLine Ambulance", meta: "3 mins away" },
  { Icon: Shield, color: "#2563ff", name: "Central Police Station", meta: "1.8 km away" },
  { Icon: Users, color: "#22c55e", name: "Fast Rescue Team", meta: "4 mins away" },
  { Icon: Truck, color: "#22c55e", name: "Quick Tow Services", meta: "2.7 km away" },
];

const allServices = [
  { Icon: Hospital, label: "Hospitals", desc: "Find nearest trauma centers and hospitals instantly.", color: "#ff1e2d" },
  { Icon: Ambulance, label: "Ambulances", desc: "Get ambulance services near you in just a few taps.", color: "#2563ff" },
  { Icon: Shield, label: "Police Stations", desc: "Find nearby police stations for immediate assistance.", color: "#2563ff" },
  { Icon: Truck, label: "Towing Services", desc: "Locate towing services, puncture shops and mechanics.", color: "#22c55e" },
  { Icon: Users, label: "Rescue Teams", desc: "Connect with vehicle rescue teams in your area.", color: "#f97316" },
  { Icon: Globe, label: "Puncture Shops", desc: "Find nearby puncture shops for quick assistance.", color: "#9333ea" },
  { Icon: Truck, label: "Showrooms", desc: "Search nearby car & bike showrooms for quick support.", color: "#2563ff" },
  { Icon: Phone, label: "Emergency Contacts", desc: "Access important emergency contacts globally.", color: "#9333ea" },
  { Icon: Droplet, label: "Blood Banks", desc: "Locate nearest blood banks to help save lives.", color: "#ff1e2d" },
  { Icon: Pill, label: "Pharmacies", desc: "Find nearby pharmacies and medical stores.", color: "#22c55e" },
];

function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosType, setSosType] = useState<'HOSPITAL' | 'AMBULANCE' | 'POLICE' | 'TOWING' | 'RESCUE'>('AMBULANCE');
  const [sosDescription, setSosDescription] = useState('');
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeSos, setActiveSos] = useState<SosRequest | null>(null);

  // Simulation drive states
  const [viewMode, setViewMode] = useState<'IMAGE' | 'GAME'>('IMAGE');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [accidentSosTimer, setAccidentSosTimer] = useState<number | null>(null);
  const [accidentCoords, setAccidentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [accidentSpeed, setAccidentSpeed] = useState<number | null>(null);
  const [accidentForce, setAccidentForce] = useState<string | null>(null);
  const [accidentSeverity, setAccidentSeverity] = useState<string>('LOW');

  const processedAlertsRef = useRef<Set<string>>(new Set());

  const fetchActiveSos = async () => {
    if (!user) return;
    try {
      const res = await sosApi.getMyRequests({ page: 1, limit: 10 });
      if (res.success && res.data) {
        const active = res.data.find(req => 
          req.status === 'PENDING' || 
          req.status === 'ACCEPTED' || 
          req.status === 'IN_PROGRESS'
        );
        setActiveSos(active || null);

        // Detect admin-triggered collision alert for this user
        if (active && active.status === 'PENDING' && active.description === 'ADMIN_TRIGGERED_COLLISION_ALERT' && !processedAlertsRef.current.has(active.id)) {
          processedAlertsRef.current.add(active.id);
          setAccidentCoords({ latitude: active.latitude, longitude: active.longitude });
          if (active.address) setAddress(active.address);
          setAccidentSosTimer(10);
          playBeep();
          toast.error("🚨 Simulated Accident Alert Dispatched by Super Admin! Initializing countdown.");
        }
      }
    } catch (err) {
      console.error("Failed to load active SOS requests:", err);
    }
  };

  useEffect(() => {
    fetchActiveSos();

    // Poll every 2 seconds for real-time status updates
    const interval = setInterval(fetchActiveSos, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchAddressName = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`, {
        headers: {
          'User-Agent': 'ROADSOS-Emergency-Beacon'
        }
      });
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`GPS Position (Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)})`);
      }
    } catch (err) {
      setAddress(`GPS Position (Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)})`);
    }
  };

  const startSosFlow = () => {
    if (!user) {
      toast.error("Please login to trigger an emergency SOS alert.");
      navigate({ to: "/login" });
      return;
    }

    setIsSosModalOpen(true);
    setIsLocating(true);
    setCoords(null);
    setAddress("Acquiring GPS Signal...");

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser. Using simulated location.");
      const lat = 12.82739;
      const lng = 77.58999;
      setCoords({ latitude: lat, longitude: lng });
      setIsLocating(false);
      fetchAddressName(lat, lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ latitude: lat, longitude: lng });
        setIsLocating(false);
        fetchAddressName(lat, lng);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("GPS Signal Timeout. Using default emergency coordinates.");
        const lat = 12.82739;
        const lng = 77.58999;
        setCoords({ latitude: lat, longitude: lng });
        setIsLocating(false);
        fetchAddressName(lat, lng);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleTriggerSos = async (e?: React.FormEvent, isAuto: boolean = false) => {
    if (e) e.preventDefault();
    const currentCoords = isAuto ? (accidentCoords || coords) : coords;
    if (!currentCoords) {
      toast.error("Cannot transmit SOS without location details.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await sosApi.create({
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        emergencyType: isAuto ? 'AMBULANCE' : sosType,
        address: address || (isAuto ? `Accident Site near Kaggalipura, Bangalore` : `GPS Position Locked`),
        description: isAuto 
          ? `Auto-SOS triggered by simulated vehicle collision. Collision Speed: ${accidentSpeed ?? 0} km/h, Impact Force: ${accidentForce ?? '0'}G.`
          : (sosDescription || 'Manual emergency broadcast.'),
        severity: isAuto ? accidentSeverity : 'LOW'
      });
      if (res.success) {
        toast.success(isAuto ? "🚨 Auto-SOS Emergency Transmitted!" : "🚨 Emergency SOS Alert Transmitted!");
        setActiveSos(res.data);
        setIsSosModalOpen(false);
        setSosDescription('');
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to transmit SOS alert.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSos = async () => {
    if (!activeSos) return;
    const confirmCancel = window.confirm("Are you sure you want to cancel the emergency SOS beacon? Rescuers will be recalled.");
    if (!confirmCancel) return;

    try {
      const res = await sosApi.cancel(activeSos.id);
      if (res.success) {
        toast.success("SOS Emergency Beacon Deactivated.");
        setActiveSos(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel SOS.");
    }
  };

  // Sound generator helper using Web Audio API: "ti-ti" beep
  const playBeep = () => {
    if (typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // First beep "ti"
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1000, audioCtx.currentTime); // 1000Hz
      gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.1);
      
      // Second beep "ti" after 150ms
      setTimeout(() => {
        if (audioCtx.state === 'closed') return;
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1000, audioCtx.currentTime);
        gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.1);
        
        setTimeout(() => {
          audioCtx.close().catch(() => {});
        }, 200);
      }, 150);
    } catch (e) {
      console.warn("Web Audio beep failed:", e);
    }
  };

  // Auto SOS countdown timer effect
  useEffect(() => {
    if (accidentSosTimer === null) return;
    
    if (accidentSosTimer === 0) {
      if (!activeSos) {
        handleTriggerSos(undefined, true);
      }
      setAccidentSosTimer(null);
      setAccidentCoords(null);
      return;
    }

    const t = setTimeout(() => {
      playBeep();
      setAccidentSosTimer(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(t);
  }, [accidentSosTimer, accidentCoords, address]);

  // Handle postMessage events from car simulator iframe
  useEffect(() => {
    const handleGameMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'CAR_DRIVING') {
        const lat = data.lat;
        const lng = data.lng;
        setCoords({ latitude: lat, longitude: lng });
        setAddress(`GPS position at (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
      } else if (data.type === 'CAR_ACCIDENT') {
        const lat = data.lat;
        const lng = data.lng;
        setAccidentCoords({ latitude: lat, longitude: lng });
        setAccidentSpeed(data.speed || 0);
        setAccidentForce(data.force || "0");
        setAccidentSeverity(data.severity || "LOW");
        fetchAddressName(lat, lng);
        setAccidentSosTimer(10);
        playBeep();
        toast.error(`🚨 Simulated Vehicle Collision! Speed: ${data.speed} km/h, Force: ${data.force}G, Severity: ${data.severity}. Initializing auto-SOS countdown.`);
      }
    };

    window.addEventListener('message', handleGameMessage);
    return () => window.removeEventListener('message', handleGameMessage);
  }, [user]);

  // Send user info to driving game iframe for auto-login
  const handleIframeLoad = () => {
    if (iframeRef.current && user) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'AUTO_LOGIN',
        name: user.fullName,
        phone: user.phone || '',
        carNo: 'KA-05-MH-9999'
      }, '*');
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="relative pt-10 lg:pt-16 pb-12 overflow-hidden">
        <div className="absolute inset-0 ambient-grid opacity-25 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-10 grid lg:grid-cols-2 gap-8 items-center">
          <FadeUp>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Our <span className="gradient-text-red">Services</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-lg">
              Explore a wide range of emergency services to help you in critical situations. Fast. Reliable. Always near you.
            </p>
            <div className="mt-6">
              <button 
                onClick={() => setViewMode(viewMode === 'IMAGE' ? 'GAME' : 'IMAGE')}
                className="px-5 h-11 rounded-full btn-ghost-glass text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:border-brand-red/50 hover:text-brand-red transition-all"
              >
                {viewMode === 'IMAGE' ? '🎮 Launch 3D Drive Simulator' : '📷 Close Simulator'}
              </button>
            </div>
          </FadeUp>
          
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative rounded-3xl overflow-hidden border border-border/60 aspect-[16/10] bg-black">
            {viewMode === 'GAME' ? (
              <iframe 
                ref={iframeRef}
                src="/game/index.html" 
                onLoad={handleIframeLoad}
                className="w-full h-full border-none"
              />
            ) : (
              <>
                <img src={ambulanceCity} alt="Ambulance" className="w-full h-full object-cover" loading="lazy" width={1600} height={1024} />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* SIDEBAR + MAIN */}
      <Section className="!pt-0">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <FadeUp>
            <GlassCard hover={false}>
              <div className="text-sm font-semibold text-brand-red mb-3">All Services</div>
              <div className="space-y-1">
                {sidebar.map((s) => (
                  <button key={s.label} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${s.active ? "bg-brand-red/10 text-foreground" : "hover:bg-white/[0.04] text-muted-foreground"}`}>
                    <span style={{ color: s.color }}><s.Icon className="h-4 w-4" /></span>
                    <span className="font-medium">{s.label}</span>
                  </button>
                ))}
              </div>

              {activeSos ? (
                <div className="mt-6 rounded-2xl p-4 border border-brand-red bg-brand-red/10 animate-pulse relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-brand-red/10 rounded-full blur-xl animate-pulse" />
                  <div className="flex items-center gap-2 text-brand-red font-bold text-sm mb-1 uppercase tracking-wider">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-red animate-ping" />
                    SOS Beacon Active
                  </div>
                  <div className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Type: <strong className="text-foreground">{activeSos.emergencyType}</strong><br />
                    Status: <strong className="text-brand-red capitalize">{activeSos.status.replace('_', ' ')}</strong><br />
                    Dispatched: {new Date(activeSos.createdAt).toLocaleTimeString()}
                  </div>
                  <button 
                    onClick={handleCancelSos}
                    className="w-full py-2.5 rounded-xl border border-brand-red/50 text-brand-red hover:bg-brand-red hover:text-white transition-all text-xs font-bold bg-brand-red/5"
                  >
                    Deactivate Beacon
                  </button>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl p-4 border border-brand-red/30 bg-brand-red/5">
                  <div className="text-sm font-semibold mb-1">In an <span className="text-brand-red">Emergency</span>?</div>
                  <div className="text-xs text-muted-foreground mb-3">Press SOS now to alert your live location.</div>
                  <button 
                    onClick={startSosFlow}
                    className="w-full btn-emergency h-11 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone className="h-4 w-4" /> SOS Now
                  </button>
                </div>
              )}
            </GlassCard>
          </FadeUp>

          <FadeUp>
            <GlassCard hover={false}>
              {activeSos && (
                <div className="mb-6 p-4 rounded-2xl border border-brand-red bg-brand-red/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-brand-red">Active SOS Alert Broadcasted</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Your location {activeSos.address || "GPS location"} is broadcasting. Nearby emergency responders have been alerted.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleCancelSos}
                    className="px-4 py-2 rounded-xl bg-brand-red text-white text-xs font-bold hover:bg-brand-red/80 transition-colors shrink-0"
                  >
                    Deactivate Beacon
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand-red" />
                  <h3 className="text-lg font-bold">
                    {activeSos ? "Live Emergency Dispatch Map" : "Nearest Emergency Services"}
                  </h3>
                </div>
                <button className="px-4 h-9 rounded-full border border-brand-red/40 text-brand-red text-xs font-semibold inline-flex items-center gap-1.5">
                  <MapIcon className="h-3.5 w-3.5" /> View on Map
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-5">
                {activeSos ? "Tracking your live location and responding rescue assets" : "Real-time nearest services based on your current location"}
              </p>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  {nearby.map((n) => (
                    <div key={n.name} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-border/60 hover:bg-white/[0.05] transition-colors cursor-pointer">
                      <div className="icon-tile h-11 w-11" style={{ color: n.color }}><n.Icon className="h-5 w-5" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{n.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{n.meta}</span>
                          {n.badge && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-green/15 text-brand-green">{n.badge}</span>}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                  <button className="w-full mt-2 py-3 rounded-2xl border border-brand-red/30 text-brand-red text-sm font-semibold">See All Services Nearby</button>
                </div>
                
                <FloatingMap 
                  showLegend={false} 
                  title="" 
                  className="h-full min-h-[320px]" 
                  sosActive={!!activeSos}
                  userLocation={activeSos ? { latitude: activeSos.latitude, longitude: activeSos.longitude } : coords}
                />
              </div>
            </GlassCard>
          </FadeUp>
        </div>
      </Section>

      {/* ALL SERVICES GRID */}
      <Section className="!pt-0">
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-7 w-7 rounded-md bg-brand-red/15 grid grid-cols-2 gap-0.5 p-1">
              {Array.from({ length: 4 }).map((_, i) => <span key={i} className="rounded-sm bg-brand-red" />)}
            </div>
            <h3 className="text-lg font-bold">All Emergency Services</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
            {allServices.map((s) => (
              <GlassCard key={s.label} className="flex flex-col p-4 md:p-6">
                <div className="icon-tile h-10 w-10 md:h-12 md:w-12 mb-3" style={{ color: s.color }}>
                  <s.Icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-sm md:text-base leading-tight">{s.label}</h4>
                <p className="hidden md:block text-xs text-muted-foreground mt-1 mb-3">{s.desc}</p>
                <button className="mt-auto pt-2 inline-flex items-center gap-1 text-[11px] md:text-xs font-semibold" style={{ color: s.color }}>
                  Explore <ArrowRight className="h-3 w-3" />
                </button>
              </GlassCard>
            ))}
          </div>
        </GlassCard>
      </Section>

      {/* WHY USE */}
      <Section className="!pt-0">
        <GlassCard hover={false}>
          <h3 className="text-xl font-bold mb-6">Why Use <span className="text-foreground">ROAD</span><span className="gradient-text-red">SOS</span> Services?</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { Icon: MapPin, title: "Real-time Location Based Services", desc: "Get the nearest emergency services based on your real-time location.", color: "#ff1e2d" },
              { Icon: Plus, title: "Fast & Reliable", desc: "Quick access to critical services when every second matters.", color: "#2563ff" },
              { Icon: Globe, title: "Works Offline", desc: "Access important contacts and services even without internet.", color: "#22c55e" },
              { Icon: Globe, title: "Global Coverage", desc: "Reliable emergency assistance across countries.", color: "#9333ea" },
              { Icon: Shield, title: "Trusted & Secure", desc: "Your safety and data privacy are our top priority.", color: "#f97316" },
            ].map((w) => (
              <div key={w.title}>
                <div className="icon-tile h-12 w-12 mb-3" style={{ color: w.color }}><w.Icon className="h-5 w-5" /></div>
                <div className="font-semibold text-sm">{w.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{w.desc}</div>
              </div>
            ))}
          </div>
        </GlassCard>
        <SafetyBannerCTA />
      </Section>

      {/* EMERGENCY SOS TRANSMISSION MODAL */}
      <AnimatePresence>
        {isSosModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsSosModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg glass-card rounded-3xl p-6 md:p-8 overflow-hidden border border-brand-red/30 shadow-[0_0_50px_rgba(255,30,45,0.15)]"
            >
              {/* Pulsing red top light */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-64 bg-brand-red/10 rounded-full blur-3xl animate-pulse" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsSosModalOpen(false)}
                disabled={isSubmitting}
                className="absolute top-4 right-4 h-8 w-8 rounded-full btn-ghost-glass flex items-center justify-center hover:text-brand-red"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-6 relative">
                <div className="h-12 w-12 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red animate-pulse">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold uppercase tracking-wide text-brand-red">Emergency SOS Broadcast</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Please specify emergency type to request dispatch.</p>
                </div>
              </div>

              <form onSubmit={handleTriggerSos} className="space-y-5 relative">
                {/* Geolocation status indicator */}
                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-brand-red" />
                      GPS Beacon Status:
                    </span>
                    {isLocating ? (
                      <span className="text-brand-blue flex items-center gap-1 font-semibold">
                        <Loader2 className="h-3 w-3 animate-spin" /> Locating satellites...
                      </span>
                    ) : coords ? (
                      <span className="text-brand-green font-bold flex items-center gap-1">
                        ● GPS Signal Locked
                      </span>
                    ) : (
                      <span className="text-brand-red font-semibold">GPS Error</span>
                    )}
                  </div>

                  <div className="mt-2.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Broadcast Address / Coordinates</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={isLocating || isSubmitting}
                      className="mt-1 input-glass py-2 px-3 text-xs font-mono"
                      placeholder="GPS coordinates or address details..."
                      required
                    />
                  </div>
                </div>

                {/* Emergency Type Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Emergency Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { type: 'AMBULANCE' as const, label: 'Ambulance', icon: Ambulance, color: 'text-brand-red border-brand-red/30' },
                      { type: 'HOSPITAL' as const, label: 'Medical/ER', icon: Hospital, color: 'text-brand-red border-brand-red/30' },
                      { type: 'POLICE' as const, label: 'Police/Help', icon: Shield, color: 'text-brand-blue border-brand-blue/30' },
                      { type: 'TOWING' as const, label: 'Roadside/Tow', icon: Truck, color: 'text-brand-green border-brand-green/30' },
                      { type: 'RESCUE' as const, label: 'Search/Rescue', icon: Users, color: 'text-brand-orange border-brand-orange/30' },
                    ].map((item) => {
                      const SelectedIcon = item.icon;
                      const isSelected = sosType === item.type;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setSosType(item.type)}
                          disabled={isSubmitting}
                          className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                            isSelected 
                              ? "bg-brand-red text-white border-brand-red shadow-[0_0_15px_rgba(255,30,45,0.4)] scale-[1.03]" 
                              : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10 text-muted-foreground"
                          }`}
                        >
                          <SelectedIcon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Details input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Situation details (optional)</label>
                  <textarea
                    value={sosDescription}
                    onChange={(e) => setSosDescription(e.target.value)}
                    disabled={isSubmitting}
                    className="input-glass text-sm min-h-[70px] resize-none"
                    placeholder="Describe injuries, vehicle state, or details that might help emergency crews..."
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLocating || isSubmitting}
                  className="w-full h-12 btn-emergency rounded-2xl text-sm font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Broadcasting Beacon...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 animate-pulse" />
                      Transmit SOS Beacon
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUTOMATIC CRASH DETECTED OVERLAY */}
      <AnimatePresence>
        {accidentSosTimer !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Flashing dark red backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md glass-card rounded-3xl p-8 border border-brand-red shadow-[0_0_50px_rgba(255,30,45,0.3)] text-center overflow-hidden"
            >
              {/* Pulsing red background glow */}
              <div className="absolute -inset-10 bg-brand-red/5 rounded-full blur-3xl animate-pulse" />
              
              <div className="relative space-y-6">
                {/* Flashing warning icon */}
                <div className="mx-auto h-20 w-20 rounded-full bg-brand-red/10 border-2 border-brand-red flex items-center justify-center text-brand-red animate-bounce">
                  <AlertTriangle className="h-10 w-10 animate-pulse" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-extrabold text-brand-red uppercase tracking-wider">
                    {activeSos?.description === 'ADMIN_TRIGGERED_COLLISION_ALERT' ? "🚨 Admin Dispatching SOS!" : "🚨 Collision Detected!"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    {activeSos?.description === 'ADMIN_TRIGGERED_COLLISION_ALERT'
                      ? "An emergency accident response dispatch has been initiated by the administrator."
                      : "A severe vehicle impact has been detected by the simulator telemetry."}
                  </p>
                </div>
                
                {/* Big countdown timer */}
                <div className="relative flex items-center justify-center py-4">
                  <span className="absolute h-24 w-24 rounded-full border-4 border-brand-red/20" />
                  <span className="absolute h-24 w-24 rounded-full border-4 border-t-brand-red animate-spin" />
                  <span className="text-4xl font-black text-white font-mono animate-pulse">
                    00:{accidentSosTimer.toString().padStart(2, '0')}
                  </span>
                </div>
                
                {/* Geolocation Details */}
                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location Address:</span>
                    <span className="text-white font-medium text-right max-w-[200px] truncate" title={address}>
                      {address || "Kaggalipura Road"}
                    </span>
                  </div>
                  {accidentCoords && (
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-muted-foreground">Coordinates:</span>
                      <span className="text-white">
                        {accidentCoords.latitude.toFixed(5)}, {accidentCoords.longitude.toFixed(5)}
                      </span>
                    </div>
                  )}
                  {user && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Driver:</span>
                        <span className="text-white font-medium">{user.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="text-white font-medium">{user.phone || "N/A"}</span>
                      </div>
                      {accidentSpeed !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Collision Speed:</span>
                          <span className="text-brand-red font-bold">{accidentSpeed} km/h</span>
                        </div>
                      )}
                      {accidentForce !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Impact Force:</span>
                          <span className="text-brand-red font-bold">{accidentForce} G</span>
                        </div>
                      )}
                      {accidentSeverity !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Telemetry Severity:</span>
                          <span className="text-brand-red font-bold uppercase">{accidentSeverity}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <p className="text-[11px] text-brand-red font-semibold animate-pulse">
                  {activeSos?.description === 'ADMIN_TRIGGERED_COLLISION_ALERT'
                    ? `Broadcasting administrative SOS event in ${accidentSosTimer}s...`
                    : `Broadcasting automatic emergency SOS beacon in ${accidentSosTimer}s...`}
                </p>
                
                 {/* Abort button */}
                <button
                  type="button"
                  onClick={async () => {
                    if (activeSos) {
                      try {
                        await sosApi.cancel(activeSos.id);
                        setActiveSos(null);
                        toast.success("Admin emergency dispatch cancelled.");
                        fetchActiveSos();
                      } catch (err: any) {
                        toast.error(err.message || "Failed to cancel alert.");
                      }
                    } else {
                      toast.success("Emergency broadcast aborted.");
                    }
                    setAccidentSosTimer(null);
                    setAccidentCoords(null);
                  }}
                  className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  Cancel SOS Dispatch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
