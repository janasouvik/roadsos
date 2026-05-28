import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Section, SectionHeading, FadeUp } from "@/components/Section";
import { GlassCard } from "@/components/GlassCard";
import { User, Mail, Phone, Shield, Loader2, AlertTriangle, X, Send, Ambulance, Hospital, Truck, Users, MapPin } from "lucide-react";
import { SuperAdminDashboard } from "@/components/SuperAdminDashboard";
import { PoliceDashboard } from "@/components/PoliceDashboard";
import { HospitalDashboard } from "@/components/HospitalDashboard";
import { sosApi, SosRequest } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [sosRequests, setSosRequests] = useState<SosRequest[]>([]);
  const [activeSos, setActiveSos] = useState<SosRequest | null>(null);
  const [loadingSos, setLoadingSos] = useState(true);

  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosType, setSosType] = useState<'HOSPITAL' | 'AMBULANCE' | 'POLICE' | 'TOWING' | 'RESCUE'>('AMBULANCE');
  const [sosDescription, setSosDescription] = useState('');
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin-triggered SOS states in user dashboard
  const [accidentSosTimer, setAccidentSosTimer] = useState<number | null>(null);
  const [accidentCoords, setAccidentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const processedAlertsRef = useRef<Set<string>>(new Set());

  const fetchSosData = async () => {
    if (!user) return;
    try {
      const res = await sosApi.getMyRequests({ page: 1, limit: 10 });
      if (res.success && res.data) {
        setSosRequests(res.data);
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
      console.error("Failed to load SOS history:", err);
    } finally {
      setLoadingSos(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSosData();
      const interval = setInterval(fetchSosData, 2000);
      return () => clearInterval(interval);
    }
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

  const handleTriggerSos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) {
      toast.error("Cannot transmit SOS without location details.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await sosApi.create({
        latitude: coords.latitude,
        longitude: coords.longitude,
        emergencyType: sosType,
        address: address,
        description: sosDescription
      });
      if (res.success) {
        toast.success("🚨 Emergency SOS Alert Transmitted!");
        setIsSosModalOpen(false);
        setSosDescription('');
        fetchSosData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to transmit SOS alert.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSos = async (id: string) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this emergency SOS beacon? Rescuers will be recalled.");
    if (!confirmCancel) return;

    try {
      const res = await sosApi.cancel(id);
      if (res.success) {
        toast.success("SOS Emergency Beacon Deactivated.");
        fetchSosData();
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

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <>
      <Section>
        <SectionHeading title="Dashboard" eyebrow={<><User className="h-3 w-3" /> Welcome Back, {user.fullName}</>} />
        
        {user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? (
          <SuperAdminDashboard />
        ) : user.role === 'POLICE' ? (
          <PoliceDashboard />
        ) : user.role === 'HOSPITAL' ? (
          <HospitalDashboard />
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FadeUp>
              <GlassCard className="flex flex-col gap-4">
                <h3 className="text-xl font-bold">Profile Details</h3>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Phone</div>
                    <div className="font-medium">{user.phone || "Not provided"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Role</div>
                    <div className="font-medium capitalize">{user.role.toLowerCase()}</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    logout();
                    navigate({ to: "/login" });
                  }} 
                  className="mt-4 w-full h-11 rounded-xl btn-ghost-glass text-sm font-semibold text-brand-red hover:bg-brand-red/10 cursor-pointer"
                >
                  Sign Out
                </button>
              </GlassCard>
            </FadeUp>

            <FadeUp delay={0.1}>
              <GlassCard className="flex flex-col gap-4 h-full">
                <h3 className="text-xl font-bold">Emergency Contacts</h3>
                <p className="text-sm text-muted-foreground">No emergency contacts added yet.</p>
                <button className="mt-auto w-full h-11 rounded-xl btn-ghost-glass text-sm font-semibold cursor-pointer">
                  Add Contact
                </button>
              </GlassCard>
            </FadeUp>

            <FadeUp delay={0.2}>
              <GlassCard className="flex flex-col gap-4 h-full min-h-[350px]">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold">Recent SOS Alerts</h3>
                  {activeSos && (
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-red animate-ping" />
                  )}
                </div>

                {loadingSos ? (
                  <div className="flex-grow flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : sosRequests.length === 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground flex-grow flex items-center justify-center text-center">
                      You have no active or recent emergency requests.
                    </p>
                    <button 
                      onClick={startSosFlow}
                      className="mt-auto w-full h-11 rounded-xl btn-emergency text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Phone className="h-4 w-4" /> Trigger SOS
                    </button>
                  </>
                ) : (
                  <div className="flex-grow flex flex-col gap-3 justify-between">
                    <div className="flex flex-col gap-3">
                      {activeSos && (
                        <div className="p-3 rounded-xl border border-brand-red bg-brand-red/10 animate-pulse flex flex-col gap-2 relative overflow-hidden">
                          <div className="text-[10px] font-bold text-brand-red uppercase tracking-wider flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-brand-red animate-ping" />
                            Active SOS Request
                          </div>
                          <div className="text-xs">
                            Type: <strong className="text-foreground">{activeSos.emergencyType}</strong><br />
                            Status: <strong className="text-brand-red capitalize">{activeSos.status.replace('_', ' ')}</strong><br />
                            Time: {new Date(activeSos.createdAt).toLocaleTimeString()}
                          </div>
                          <button 
                            onClick={() => handleCancelSos(activeSos.id)}
                            className="mt-1 w-full py-1.5 rounded-lg bg-brand-red/10 border border-brand-red/35 hover:bg-brand-red hover:text-white text-[11px] font-bold transition-all text-brand-red cursor-pointer"
                          >
                            Deactivate Beacon
                          </button>
                        </div>
                      )}

                      <div className="space-y-2 overflow-y-auto max-h-[170px] pr-1">
                        {sosRequests.map((req) => {
                          const isActive = req.status === 'PENDING' || req.status === 'ACCEPTED' || req.status === 'IN_PROGRESS';
                          if (isActive && req.id === activeSos?.id) return null; // Already shown above
                          
                          return (
                            <div key={req.id} className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-3 text-xs">
                              <div className="min-w-0">
                                <div className="font-semibold capitalize flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full" style={{
                                    backgroundColor: req.status === 'COMPLETED' ? '#22c55e' : req.status === 'CANCELLED' ? '#71717a' : '#ff1e2d'
                                  }} />
                                  {req.emergencyType.toLowerCase()} Request
                                </div>
                                <div className="text-muted-foreground truncate mt-0.5 max-w-[150px]">
                                  {req.address || "GPS Position"}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                  {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>

                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                req.status === 'COMPLETED' 
                                  ? 'bg-brand-green/10 text-brand-green' 
                                  : req.status === 'CANCELLED' 
                                  ? 'bg-white/10 text-muted-foreground' 
                                  : 'bg-brand-red/10 text-brand-red'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {!activeSos && (
                      <button 
                        onClick={startSosFlow}
                        className="mt-auto w-full h-11 rounded-xl btn-emergency text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Phone className="h-4 w-4" /> Trigger New SOS
                      </button>
                    )}
                  </div>
                )}
              </GlassCard>
            </FadeUp>
          </div>
        )}
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
                className="absolute top-4 right-4 h-8 w-8 rounded-full btn-ghost-glass flex items-center justify-center hover:text-brand-red cursor-pointer"
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
                          className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
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
                  className="w-full h-12 btn-emergency rounded-2xl text-sm font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

      {/* AUTOMATIC ADMIN DISPATCH DETECTED OVERLAY */}
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
                    🚨 Admin Dispatching SOS!
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    An emergency accident response dispatch has been initiated by the administrator.
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
                    </>
                  )}
                </div>
                
                <p className="text-[11px] text-brand-red font-semibold animate-pulse">
                  Broadcasting administrative SOS event in {accidentSosTimer}s...
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
                        fetchSosData();
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
