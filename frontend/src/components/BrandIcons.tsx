// Inline brand SVGs (lucide-react no longer ships brand icons due to trademarks).
import type { SVGProps } from "react";

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  ...props,
});

export const FacebookIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.4v7A10 10 0 0 0 22 12z"/>
  </svg>
);

export const TwitterIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M18.244 3H21l-6.52 7.45L22 21h-6.5l-5.1-6.66L4.5 21H1.74l7-8L1.5 3H8.2l4.6 6.07L18.244 3zm-2.28 16.2h1.5L7.1 4.7H5.5l10.464 14.5z"/>
  </svg>
);

export const InstagramIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
  </svg>
);

export const LinkedinIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.5 18H6V10h2.5v8zM7.25 8.8a1.45 1.45 0 1 1 0-2.9 1.45 1.45 0 0 1 0 2.9zM18.5 18H16v-4.2c0-1-.4-1.7-1.3-1.7s-1.4.6-1.6 1.2c-.1.2-.1.5-.1.7V18H10.5s.1-7.4 0-8h2.5v1.1c.3-.5 1-1.3 2.5-1.3 1.8 0 3 1.2 3 3.6V18z"/>
  </svg>
);

export const YoutubeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M23 7.5s-.2-1.6-.9-2.3c-.8-.9-1.7-.9-2.1-1C16.9 4 12 4 12 4s-4.9 0-8 .2c-.4.1-1.3.1-2.1 1C1.2 5.9 1 7.5 1 7.5S.8 9.4.8 11.3v1.4C.8 14.6 1 16.5 1 16.5s.2 1.6.9 2.3c.8.9 1.9.8 2.3 1 1.7.2 7.8.2 7.8.2s4.9 0 8-.2c.4-.1 1.3-.1 2.1-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1.4c0-1.9-.2-3.8-.2-3.8zM9.7 14.7V8.4l6.4 3.2-6.4 3.1z"/>
  </svg>
);

export const GoogleIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} fill="none">
    <path fill="#FFC107" d="M21.8 10.4H12v3.8h5.6c-.5 2.5-2.7 4-5.6 4-3.4 0-6.2-2.8-6.2-6.2S8.6 5.8 12 5.8c1.5 0 2.9.5 4 1.5l2.7-2.7C16.9 3 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.7 0 9.5-4 9.5-9.7 0-.7-.1-1.3-.2-1.9z"/>
    <path fill="#FF3D00" d="M3.2 7.3l3.1 2.3c.9-2 2.7-3.4 5-3.4 1.5 0 2.9.5 4 1.5l2.7-2.7C16.4 3.4 14.3 2.5 12 2.5 8.2 2.5 4.9 4.5 3.2 7.3z"/>
    <path fill="#4CAF50" d="M12 21.5c2.5 0 4.7-.9 6.4-2.4l-2.9-2.5c-.9.7-2.1 1.1-3.4 1.1-2.9 0-5.1-1.7-5.6-4l-3 2.3C5.1 19.4 8.3 21.5 12 21.5z"/>
    <path fill="#1976D2" d="M21.8 10.4H12v3.8h5.6c-.3 1.4-1.1 2.4-2.1 3.1l2.9 2.5c2.1-1.9 3.5-4.8 3.5-8 0-.7-.1-1-.1-1.4z"/>
  </svg>
);

export const AppleIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.4-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.1.8 1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.5-1-2.7-3.7zM14.2 5.7c.7-.8 1.1-1.9 1-3-1 .1-2.1.7-2.8 1.5-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.6 2.8-1.4z"/>
  </svg>
);
