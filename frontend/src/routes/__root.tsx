import { useEffect } from "react";
import { App } from "@capacitor/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
  ScriptOnce,
  Link,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center glass-card rounded-3xl p-10">
        <h1 className="text-7xl font-bold gradient-text-red">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="mt-6 inline-flex h-11 items-center px-5 rounded-full btn-emergency text-sm font-semibold">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center glass-card rounded-3xl p-10">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try again or head home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="h-11 px-5 rounded-full btn-emergency text-sm font-semibold">Try again</button>
          <a href="/" className="h-11 inline-flex items-center px-5 rounded-full btn-ghost-glass text-sm font-medium">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ROADSOS — Emergency Help Within Seconds" },
      { name: "description", content: "ROADSOS connects you to the nearest hospitals, ambulances, police stations and rescue teams instantly during road emergencies." },
      { property: "og:title", content: "ROADSOS — Emergency Help Within Seconds" },
      { property: "og:description", content: "Locate nearby hospitals, ambulances, rescue teams and essential services instantly during road accidents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`;

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <ScriptOnce>{themeScript}</ScriptOnce>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const location = useLocation();
  const { pathname } = location;
  const isAuth = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    let lastBackPress = 0;
    const listener = App.addListener('backButton', () => {
      if (pathname === '/') {
        const now = Date.now();
        if (now - lastBackPress < 2000) {
          App.exitApp();
        } else {
          lastBackPress = now;
          toast('Press back again to exit', { duration: 2000 });
        }
      } else {
        if (window.history.length > 2) {
          router.history.back();
        } else {
          router.navigate({ to: '/' });
        }
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [pathname, router]);

  return (
    <QueryClientProvider client={queryClient}>
      {isAuth ? (
        <Outlet />
      ) : (
        <div className="flex min-h-screen flex-col pb-16 md:pb-0">
          <MobileHeader />
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      )}
      <Toaster />
    </QueryClientProvider>
  );
}
