import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldPlus, MapPin, Bell, Lock, LogIn, Eye, EyeOff, Mail, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { GoogleIcon, AppleIcon, FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from "@/components/BrandIcons";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — ROADSOS" },
      { name: "description", content: "Login to your ROADSOS account to manage your profile and stay prepared." },
      { property: "og:title", content: "Login to ROADSOS" },
    ],
  }),
  component: Login,
});

function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await login({ email, password });
    if (result.success) {
      navigate({ to: "/dashboard" });
    } else {
      setError(result.message);
    }
  };

  return (
    <>
      <AuthLayout
        side={{
          title: <>Welcome Back!<br/>Login to <span className="gradient-text-red">Your Account</span></>,
          description: "Access your ROADSOS dashboard to manage your profile, emergency contacts and stay prepared. Always.",
          bullets: [
            { Icon: ShieldPlus, title: "Stay Prepared", text: "Update your profile and emergency information anytime.", color: "#ff1e2d" },
            { Icon: MapPin, title: "Real-time Protection", text: "Get alerts and assistance whenever you need it.", color: "#2563ff" },
            { Icon: Bell, title: "24/7 Support", text: "Our team is always here to help you.", color: "#22c55e" },
          ],
        }}
      >
        <Link 
          to="/" 
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h2 className="text-3xl font-bold">Login</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Don't have an account? <Link to="/signup" className="text-brand-red font-semibold">Sign up</Link>
        </p>

        <div className="mt-6 space-y-3">
          <button className="w-full h-12 rounded-2xl border border-border bg-white/[0.02] inline-flex items-center justify-center gap-3 text-sm font-medium hover:bg-white/[0.05]">
            <GoogleIcon className="h-5 w-5" /> Continue with Google
          </button>
          <button className="w-full h-12 rounded-2xl border border-border bg-white/[0.02] inline-flex items-center justify-center gap-3 text-sm font-medium hover:bg-white/[0.05]">
            <AppleIcon className="h-5 w-5" /> Continue with Apple
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {error && (
          <div className="mb-4 rounded-xl p-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium block mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                className="input-glass pr-10"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                id="login-email"
              />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                className="input-glass pr-10"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                id="login-password"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-[#ff1e2d]" />
              <span>Remember me</span>
            </label>
            <Link to="/login" className="text-brand-red font-semibold">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            id="login-submit"
            disabled={isLoading}
            className="w-full h-12 rounded-2xl btn-emergency text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Logging in...</>
            ) : (
              <><LogIn className="h-4 w-4" /> Login</>
            )}
          </button>
        </form>

        <div className="mt-6 rounded-2xl p-4 flex items-center gap-3 border border-border/60 bg-white/[0.02]">
          <div className="icon-tile h-10 w-10 text-muted-foreground"><Lock className="h-4 w-4" /></div>
          <div className="text-xs text-muted-foreground">Your data is protected with industry-standard encryption.</div>
        </div>
      </AuthLayout>

      <footer className="border-t border-border/60 mt-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Logo withTagline />
          <div className="flex gap-5 text-xs text-muted-foreground">
            {["Privacy Policy", "Terms of Service", "FAQ", "Support"].map((l) => (
              <a key={l} href="#" className="hover:text-foreground">{l}</a>
            ))}
          </div>
          <div className="flex gap-2">
            {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon].map((I, i) => (
              <a key={i} href="#" className="h-8 w-8 rounded-full btn-ghost-glass flex items-center justify-center"><I className="h-3.5 w-3.5" /></a>
            ))}
          </div>
        </div>
        <div className="text-center text-[11px] text-muted-foreground pb-5">© 2026 ROADSOS. All rights reserved.</div>
      </footer>
    </>
  );
}
