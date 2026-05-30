import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const defaultLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/features", label: "Features" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

const getNavLinks = (role: string | undefined) => {
  if (role === 'SUPER_ADMIN') {
    return [
      { to: "/", label: "Home" },
      { to: "/dashboard", label: "Dashboard" }
    ];
  }
  if (role === 'ADMIN' || role === 'POLICE' || role === 'HOSPITAL') {
    return [
      { to: "/", label: "Home" },
      { to: "/dashboard", label: "Dashboard" },
      { to: "/about", label: "About Us" },
      { to: "/contact", label: "Contact" }
    ];
  }
  if (role === 'USER') {
    return [
      { to: "/", label: "Home" },
      { to: "/services", label: "Services" },
      { to: "/about", label: "About Us" },
      { to: "/contact", label: "Contact" }
    ];
  }
  return defaultLinks;
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:block sticky top-0 z-50 glass-nav"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 h-[72px] flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0">
          <Logo withTagline />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {getNavLinks(user?.role).map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "relative px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-[#ff1e2d] to-[#ff5b6b]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link
              to="/profile"
              className="hidden sm:inline-flex h-10 items-center px-4 rounded-full text-sm font-semibold btn-ghost-glass"
            >
              Profile
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex h-10 items-center px-4 rounded-full text-sm font-medium btn-ghost-glass"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="hidden sm:inline-flex h-10 items-center px-4 rounded-full text-sm font-semibold btn-emergency"
              >
                Sign Up
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden h-10 w-10 rounded-full btn-ghost-glass flex items-center justify-center"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden border-t border-border/60"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {getNavLinks(user?.role).map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium",
                    pathname === l.to
                      ? "bg-brand-red/15 text-foreground"
                      : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-3">
                {user ? (
                  <Link to="/profile" onClick={() => setOpen(false)} className="col-span-2 h-11 rounded-full btn-ghost-glass flex items-center justify-center text-sm font-semibold">
                    Profile
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="h-11 rounded-full btn-ghost-glass flex items-center justify-center text-sm font-medium">
                      Login
                    </Link>
                    <Link to="/signup" onClick={() => setOpen(false)} className="h-11 rounded-full btn-emergency flex items-center justify-center text-sm font-semibold">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
