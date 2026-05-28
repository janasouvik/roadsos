import { useState, useEffect } from "react";
import { adminApi, UserProfile, SosRequest } from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";
import { Shield, User, MapPin, Phone, Mail, AlertCircle, AlertTriangle, Loader2, Clock, CheckCircle, XCircle, Link as LinkIcon, Image, Video, Volume2, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function PoliceDashboard() {
  const [activeTab, setActiveTab] = useState<"sos" | "users" | "admins">("sos");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sosRequests, setSosRequests] = useState<SosRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [selectedSos, setSelectedSos] = useState<SosRequest | null>(null);
  
  // Filtering and search states
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setExpandedUserId(null);
    setSelectedSos(null);
    fetchData();
  }, [activeTab]);

  // Real-time polling for SOS requests
  useEffect(() => {
    if (activeTab !== "sos") return;
    
    const interval = setInterval(() => {
      fetchSosRequestsSilently();
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const res = await adminApi.getUsers({ role: "USER", limit: 100 });
        if (res.success) setUsers(res.data);
      } else if (activeTab === "admins") {
        const res = await adminApi.getUsers({ role: "ADMIN", limit: 100 });
        if (res.success) setUsers(res.data);
      } else {
        await fetchSosRequests();
      }
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSosRequests = async () => {
    try {
      const res = await adminApi.getSosRequests({ limit: 100 });
      if (res.success) {
        setSosRequests(res.data);
      }
    } catch {
      toast.error("Failed to fetch SOS reports");
    }
  };

  const fetchSosRequestsSilently = async () => {
    try {
      const res = await adminApi.getSosRequests({ limit: 100 });
      if (res.success) {
        // Detect new high-severity alerts to sound a toast alert
        const currentPendingIds = new Set(sosRequests.filter(r => r.status === 'PENDING').map(r => r.id));
        res.data.forEach(req => {
          if (req.status === 'PENDING' && !currentPendingIds.has(req.id)) {
            if (req.severity === 'HIGH' || req.severity === 'CRITICAL') {
              toast.error(`🚨 CRITICAL ACCIDENT ALERT: Driver ${req.user?.fullName || 'Unknown'} - Severity: ${req.severity}`);
              playAlarmSound();
            } else {
              toast.info(`🚨 New Emergency SOS received from ${req.user?.fullName || 'User'}`);
            }
          }
        });
        setSosRequests(res.data);
        // Refresh selected SOS details if open
        if (selectedSos) {
          const updatedSelected = res.data.find(r => r.id === selectedSos.id);
          if (updatedSelected) setSelectedSos(updatedSelected);
        }
      }
    } catch (err) {
      console.warn("Silent SOS poll failed", err);
    }
  };

  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch alarm tone
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio context block safety
    }
  };

  const handleUpdateStatus = async (sosId: string, newStatus: string) => {
    try {
      const res = await adminApi.updateSosStatus(sosId, newStatus, "Delhi Police Patrol");
      if (res.success) {
        toast.success(`SOS request status updated to ${newStatus}`);
        fetchSosRequests();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update SOS status");
    }
  };

  const handleTriggerSos = async (userId: string) => {
    try {
      const res = await adminApi.triggerSos(userId, {
        emergencyType: "POLICE",
        latitude: 12.82739,
        longitude: 77.58999,
        address: "Kaggalipura Road - Accident Warning Dispatched by Police Admin",
        description: "ADMIN_TRIGGERED_COLLISION_ALERT"
      });
      if (res.success) {
        toast.success("🚨 Accident response warning dispatched to the user screen!");
      }
    } catch (error) {
      toast.error("Failed to send accident response");
    }
  };

  // Filter requests
  const filteredSos = sosRequests.filter(req => {
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    const matchesSeverity = severityFilter === "ALL" || req.severity === severityFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      (req.user?.fullName || "").toLowerCase().includes(query) ||
      (req.user?.vehicleNumber || "").toLowerCase().includes(query) ||
      (req.address || "").toLowerCase().includes(query);
    
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  const getSeverityBadgeColor = (severity?: string) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL": return "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse";
      case "HIGH": return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
      case "MEDIUM": return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      default: return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "ACCEPTED": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "IN_PROGRESS": return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      case "COMPLETED": return "bg-green-500/10 text-green-500 border border-green-500/20";
      default: return "bg-white/5 text-muted-foreground border border-white/5";
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-8">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        <button
          onClick={() => setActiveTab("sos")}
          className={`flex items-center justify-between p-4 rounded-xl font-medium transition-colors ${
            activeTab === "sos"
              ? "bg-brand-red text-white"
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            SOS Reports
          </div>
          {sosRequests.filter(r => r.status === 'PENDING').length > 0 && (
            <span className="bg-white text-brand-red px-2 py-0.5 text-xs font-bold rounded-full animate-bounce">
              {sosRequests.filter(r => r.status === 'PENDING').length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${
            activeTab === "users"
              ? "bg-brand-red text-white"
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <User className="h-5 w-5" />
          All Users
        </button>

        <button
          onClick={() => setActiveTab("admins")}
          className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${
            activeTab === "admins"
              ? "bg-brand-red text-white"
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <Shield className="h-5 w-5" />
          All Admins
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <GlassCard className="min-h-[500px]">
          {/* TAB 1: SOS INCIDENT MONITORING */}
          {activeTab === "sos" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">🚨 Live Incident Reports (Police Desk)</h2>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search by driver, vehicle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-glass pl-9 pr-4 text-xs h-10 w-full"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl border border-white/5 bg-white/[0.02] text-xs">
                <div className="flex items-center gap-2 text-muted-foreground mr-2">
                  <Filter className="h-3.5 w-3.5" /> Filters:
                </div>
                
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-white"
                >
                  <option value="ALL" className="bg-[#0f172a]">All Statuses</option>
                  <option value="PENDING" className="bg-[#0f172a]">Pending</option>
                  <option value="ACCEPTED" className="bg-[#0f172a]">Accepted</option>
                  <option value="IN_PROGRESS" className="bg-[#0f172a]">In Progress</option>
                  <option value="COMPLETED" className="bg-[#0f172a]">Closed</option>
                  <option value="CANCELLED" className="bg-[#0f172a]">Cancelled</option>
                </select>

                {/* Severity Filter */}
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-white"
                >
                  <option value="ALL" className="bg-[#0f172a]">All Severities</option>
                  <option value="LOW" className="bg-[#0f172a]">Low</option>
                  <option value="MEDIUM" className="bg-[#0f172a]">Medium</option>
                  <option value="HIGH" className="bg-[#0f172a]">High</option>
                  <option value="CRITICAL" className="bg-[#0f172a]">Critical</option>
                </select>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="animate-spin h-8 w-8 text-brand-red" />
                </div>
              ) : filteredSos.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">No incident reports found matching filters.</p>
              ) : (
                <div className="grid gap-4">
                  {filteredSos.map((req) => {
                    const isCriti = req.severity === 'CRITICAL' || req.severity === 'HIGH';
                    return (
                      <div 
                        key={req.id} 
                        className={`p-5 rounded-2xl border transition-all ${
                          isCriti && req.status === 'PENDING'
                            ? "bg-red-500/5 border-red-500/30 hover:border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            {/* Header row */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityBadgeColor(req.severity)}`}>
                                {req.severity || "LOW"}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadgeColor(req.status)}`}>
                                {req.status}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                                <Clock className="h-3 w-3" /> {new Date(req.createdAt).toLocaleString()}
                              </span>
                            </div>

                            {/* Driver and Vehicle */}
                            <div>
                              <div className="font-semibold text-lg flex items-center gap-2">
                                <User className="h-4.5 w-4.5 text-muted-foreground" />
                                {req.user?.fullName || "Anonymous Driver"}
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5 mt-2.5 text-xs text-muted-foreground">
                                <div>
                                  <strong className="text-foreground">Vehicle Number:</strong>{" "}
                                  <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded uppercase">{req.user?.vehicleNumber || "N/A"}</span>
                                </div>
                                <div>
                                  <strong className="text-foreground">Vehicle Brand/Model:</strong>{" "}
                                  <span className="text-white">{req.user?.vehicleModel || "N/A"}</span>
                                </div>
                                <div>
                                  <strong className="text-foreground">Vehicle Type:</strong>{" "}
                                  <span className="text-white capitalize">{req.user?.vehicleType || "N/A"}</span>
                                </div>
                                <div>
                                  <strong className="text-foreground">Driving License:</strong>{" "}
                                  <span className="text-white font-mono uppercase">{req.user?.dlNumber || "N/A"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Location mapping link */}
                            <div className="flex items-start gap-2 text-xs">
                              <MapPin className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                              <div>
                                <div className="text-white font-medium">{req.address || "Kaggalipura road, Bangalore"}</div>
                                <a 
                                  href={req.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${req.latitude},${req.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-red font-semibold inline-flex items-center gap-1 mt-1 hover:underline cursor-pointer"
                                >
                                  <LinkIcon className="h-3 w-3" /> View Route on Google Maps
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Quick police dispatch actions */}
                          <div className="flex flex-row lg:flex-col items-stretch justify-center gap-2 lg:w-48 shrink-0">
                            <button
                              onClick={() => setSelectedSos(req)}
                              className="flex-1 lg:flex-initial btn-ghost-glass px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Show Evidence
                            </button>

                            {req.status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateStatus(req.id, "ACCEPTED")}
                                className="flex-1 lg:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Dispatch Patrol
                              </button>
                            )}

                            {req.status === 'ACCEPTED' && (
                              <button
                                onClick={() => handleUpdateStatus(req.id, "IN_PROGRESS")}
                                className="flex-1 lg:flex-initial bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <AlertCircle className="h-3.5 w-3.5" /> Mark Active
                              </button>
                            )}

                            {(req.status === 'PENDING' || req.status === 'ACCEPTED' || req.status === 'IN_PROGRESS') && (
                              <button
                                onClick={() => handleUpdateStatus(req.id, "COMPLETED")}
                                className="flex-1 lg:flex-initial bg-green-600 hover:bg-green-700 text-white px-3 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Close Incident
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALL USERS DIRECTORY */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">All Users</h2>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="animate-spin h-8 w-8 text-brand-red" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">No user profiles registered.</p>
              ) : (
                <div className="grid gap-4">
                  {users.map((u) => (
                    <div key={u.id} className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="font-semibold text-lg">{u.fullName}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="h-3 w-3" /> {u.email}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Phone className="h-3 w-3" /> {u.phone || "N/A"}
                          </div>
                          <div className="text-xs mt-1 px-2 py-0.5 rounded bg-white/10 w-fit uppercase font-mono">
                            {u.role}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                            className="flex-1 sm:flex-initial btn-ghost-glass px-4 py-2 rounded-lg text-xs font-bold"
                          >
                            {expandedUserId === u.id ? "Hide Details" : "Show Profile"}
                          </button>
                          
                          <button
                            onClick={() => handleTriggerSos(u.id)}
                            className="flex-1 sm:flex-initial btn-emergency px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <AlertCircle className="h-3.5 w-3.5" />
                            Dispatch Response
                          </button>
                        </div>
                      </div>

                      {expandedUserId === u.id && (
                        <div className="pt-4 mt-2 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground animate-in fade-in duration-200">
                          <div><strong className="text-white">User ID:</strong> {u.id}</div>
                          <div><strong className="text-white">Gender:</strong> {u.gender || "Not specified"}</div>
                          <div><strong className="text-white">DOB/Age:</strong> {u.dob || "Not specified"}</div>
                          <div><strong className="text-white">Blood Group:</strong> <span className="text-brand-red font-bold">{u.bloodGroup || "Not specified"}</span></div>
                          <div><strong className="text-white">Vehicle Number:</strong> <span className="font-mono text-white">{u.vehicleNumber || "N/A"}</span></div>
                          <div><strong className="text-white">Vehicle Type:</strong> {u.vehicleType || "N/A"}</div>
                          <div><strong className="text-white">Driving License:</strong> {u.dlNumber || "N/A"}</div>
                          <div><strong className="text-white">Insurance Number:</strong> {u.insurance || "N/A"}</div>
                          <div className="md:col-span-2"><strong className="text-white">Address:</strong> {u.address || "Not specified"}</div>
                          
                          {/* Emergency Contacts */}
                          <div className="md:col-span-2 pt-2 border-t border-white/5 space-y-2">
                            <strong className="text-white uppercase tracking-wider text-[10px]">Emergency Contacts:</strong>
                            {u.emergencyContacts && u.emergencyContacts.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                                {u.emergencyContacts.map((contact, index) => (
                                  <div key={contact.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div className="font-bold text-white text-xs">{contact.name} ({contact.relationship})</div>
                                    <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                      <Phone className="h-3 w-3" /> {contact.phone}
                                    </div>
                                    {contact.email && (
                                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Mail className="h-3 w-3" /> {contact.email}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-muted-foreground italic text-xs">No emergency contacts registered.</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADMIN LIST DIRECTORY */}
          {activeTab === "admins" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">All Admins</h2>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="animate-spin h-8 w-8 text-brand-red" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">No administrators found.</p>
              ) : (
                <div className="grid gap-4">
                  {users.map((u) => (
                    <div key={u.id} className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-2">
                      <div className="font-semibold text-lg">{u.fullName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" /> {u.email}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" /> {u.phone || "N/A"}
                      </div>
                      <div className="text-[10px] mt-1 px-2.5 py-0.5 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red w-fit uppercase font-mono font-bold">
                        {u.role}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </div>

      {/* EVIDENCE PREVIEW OVERLAY MODAL */}
      <AnimatePresence>
        {selectedSos && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedSos(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl glass-card rounded-3xl p-6 border border-white/10 shadow-2xl text-left overflow-hidden z-10"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Accident Investigation Evidence</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">SOS Reference: {selectedSos.id.substring(0, 8)}...</p>
                </div>
                <button 
                  onClick={() => setSelectedSos(null)}
                  className="h-8 w-8 rounded-full btn-ghost-glass flex items-center justify-center cursor-pointer"
                >
                  <XCircle className="h-5 w-5 text-muted-foreground hover:text-white" />
                </button>
              </div>

              {/* Description box */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-xs mb-5">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  <AlertCircle className="h-4 w-4 text-brand-red" />
                  Impact Telemetry Summary
                </div>
                <p className="text-muted-foreground">{selectedSos.description || "No telemetry details reported."}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Collected Media Attachments</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo evidence */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-3 text-center min-h-[140px]">
                    <Image className="h-8 w-8 text-blue-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Crash Scene Image</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Automatic capture</div>
                    </div>
                    {selectedSos.accidentImage ? (
                      <a href={selectedSos.accidentImage} target="_blank" rel="noreferrer" className="text-xs text-brand-red font-bold hover:underline">View Photo</a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic px-2 py-0.5 rounded bg-white/5">Simulated: Photo Attached</span>
                    )}
                  </div>

                  {/* Video evidence */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-3 text-center min-h-[140px]">
                    <Video className="h-8 w-8 text-orange-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Dashcam Recording</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Pre-collision 5s loop</div>
                    </div>
                    {selectedSos.accidentVideo ? (
                      <a href={selectedSos.accidentVideo} target="_blank" rel="noreferrer" className="text-xs text-brand-red font-bold hover:underline">View Video</a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic px-2 py-0.5 rounded bg-white/5">Simulated: Video Attached</span>
                    )}
                  </div>

                  {/* Audio evidence */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-3 text-center min-h-[140px] sm:col-span-2">
                    <Volume2 className="h-8 w-8 text-brand-green" />
                    <div>
                      <div className="text-xs font-semibold text-white">Cabin Microphone Feed</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Post-impact 10s audio log</div>
                    </div>
                    {selectedSos.accidentAudio ? (
                      <a href={selectedSos.accidentAudio} target="_blank" rel="noreferrer" className="text-xs text-brand-red font-bold hover:underline">Listen Audio</a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic px-2 py-0.5 rounded bg-white/5">Simulated: Audio Log Attached</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contacts of user inside evidence modal */}
              {selectedSos.user?.emergencyContacts && selectedSos.user.emergencyContacts.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Notify Emergency Contacts</div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-brand-green/20 bg-brand-green/5 text-xs text-brand-green">
                    <span>Active Emergency Notification sent automatically via email to:</span>
                    <strong className="ml-2 font-mono text-white">{selectedSos.user.emergencyContacts[0].name} ({selectedSos.user.emergencyContacts[0].phone})</strong>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
