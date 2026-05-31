import { Link } from "@tanstack/react-router";
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "./BrandIcons";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative border-t border-border/60 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo withTagline />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Connecting you to the nearest emergency services. Fast, reliable, always near you.
          </p>
          <div className="flex gap-2 mt-5">
            {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon, YoutubeIcon].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 rounded-full btn-ghost-glass flex items-center justify-center hover:text-brand-red transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li><Link to="/services" className="hover:text-foreground">Services</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>+91 98765 43210</li>
            <li>support@roadsos.com</li>
            <li>123 Safety Street,<br/>Bangalore, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© 2026 ROADSOS. All rights reserved.</span>
          <span>Built for safety. Designed for speed.</span>
        </div>
      </div>
    </footer>
  );
}
