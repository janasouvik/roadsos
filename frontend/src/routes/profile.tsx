import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from "react";
import { Section, SectionHeading, FadeUp } from '@/components/Section'
import { GlassCard } from '@/components/GlassCard'
import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Phone, Shield, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/profile')({
  component: Profile,
})

function Profile() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <Section>
      <SectionHeading title="Profile" eyebrow={<><User className="h-3 w-3" /> Account Details</>} />
      
      <div className="mt-8 max-w-3xl mx-auto">
        <FadeUp>
          <GlassCard className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-2">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red text-2xl font-bold uppercase">
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.fullName}</h2>
                  <div className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Shield className="h-4 w-4" />
                    <span className="capitalize">{user.role.toLowerCase().replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }} 
                className="h-10 px-4 rounded-xl btn-ghost-glass text-sm font-semibold text-brand-red hover:bg-brand-red/10"
              >
                Sign Out
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Email Address</div>
                  <div className="font-medium text-[15px]">{user.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Phone Number</div>
                  <div className="font-medium text-[15px]">{user.phone || "Not provided"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">User ID</div>
                  <div className="font-medium text-[15px] font-mono break-all">{user.id}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Member Since</div>
                  <div className="font-medium text-[15px]">{new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Last Login</div>
                  <div className="font-medium text-[15px]">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {user.isVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                )}
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Verification Status</div>
                  <div className="font-medium text-[15px]">{user.isVerified ? "Verified Account" : "Unverified Account"}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                {user.isBlocked ? (
                  <XCircle className="h-5 w-5 text-brand-red mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                )}
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Account Status</div>
                  <div className="font-medium text-[15px]">{user.isBlocked ? <span className="text-brand-red">Blocked</span> : "Active"}</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </FadeUp>
      </div>
    </Section>
  )
}
