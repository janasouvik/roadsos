import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-50 flex md:hidden items-center justify-between px-4 h-14 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm">
      <Link to="/" className="shrink-0 flex items-center">
        <Logo />
      </Link>
      
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red"></span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
