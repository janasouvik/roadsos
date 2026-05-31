import { useState, useEffect } from "react";
import { adminApi, UserProfile } from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";
import { Shield, User, MapPin, Phone, Mail, AlertCircle, AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "admins">("users");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  useEffect(() => {
    setExpandedUserId(null);
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab: "users" | "admins") => {
    setLoading(true);
    try {
      const role = tab === "users" ? "USER" : "ADMIN";
      const res = await adminApi.getUsers({ role, limit: 100 });
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSos = async (userId: string) => {
    try {
      const res = await adminApi.triggerSos(userId, {
        emergencyType: "AMBULANCE",
        latitude: 12.82739,
        longitude: 77.58999,
        address: "Kaggalipura Road - Accident Response Dispatched by Admin",
        description: "ADMIN_TRIGGERED_COLLISION_ALERT"
      });
      if (res.success) {
        toast.success("🚨 Accident response alert transmitted to the user screen!");
      }
    } catch (error) {
      toast.error("Failed to send accident response");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex flex-col gap-2">
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

      {/* Content */}
      <div className="flex-1">
        <GlassCard className="min-h-[500px]">
          <h2 className="text-2xl font-bold mb-6 capitalize">
            {activeTab === "users" ? "All Users" : "All Admins"}
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-red"></div>
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No records found.</p>
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
                      <div className="text-xs mt-1 px-2 py-0.5 rounded bg-white/10 w-fit">
                        {u.role}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                        className="btn-ghost-glass px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        {expandedUserId === u.id ? "Hide Details" : "Show all detail"}
                      </button>
                      
                      {activeTab === "users" && (
                        <button
                          onClick={() => handleTriggerSos(u.id)}
                          className="btn-emergency px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                        >
                          <AlertCircle className="h-4 w-4" />
                          Send Accident Response
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedUserId === u.id && (
                    <div className="pt-4 mt-2 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div><strong className="text-foreground">User ID:</strong> {u.id}</div>
                      <div><strong className="text-foreground">Verification:</strong> {u.isVerified ? "Verified" : "Not Verified"}</div>
                      <div><strong className="text-foreground">Account Status:</strong> {u.isBlocked ? <span className="text-brand-red">Blocked</span> : "Active"}</div>
                      <div><strong className="text-foreground">Created At:</strong> {new Date(u.createdAt).toLocaleString()}</div>
                      <div><strong className="text-foreground">Last Login:</strong> {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

    </div>
  );
}
