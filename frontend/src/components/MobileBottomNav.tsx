import { Link, useLocation } from "@tanstack/react-router";
import { Home, ShieldPlus, Grid, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAuthority = user?.role === 'ADMIN' || user?.role === 'POLICE' || user?.role === 'HOSPITAL';

  // Base links
  const links = [
    { to: "/", label: "Home", icon: Home },
  ];

  if (isSuperAdmin || isAuthority) {
    links.push({ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard });
  } else {
    links.push({ to: "/services", label: "Emergency", icon: ShieldPlus });
  }

  // Profile link is always last
  links.push({ to: user ? "/profile" : "/login", label: user ? "Profile" : "Login", icon: User });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/85 backdrop-blur-xl border-t border-border/40 pb-safe">
      <nav className="flex justify-around items-center h-16 px-2">
        {links.map((link) => {
          const isActive = pathname === link.to;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200",
                isActive ? "text-brand-red scale-105" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full transition-colors",
                isActive ? "bg-brand-red/10" : "bg-transparent"
              )}>
                <Icon className={cn("w-5 h-5", isActive && "fill-brand-red/20")} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "font-semibold"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
