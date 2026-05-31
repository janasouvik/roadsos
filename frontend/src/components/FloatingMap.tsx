import { motion } from "framer-motion";
import {
  Plus,
  Locate,
  Minus,
  Hospital,
  Ambulance,
  Shield,
  Truck,
  Users,
  Cpu,
  Loader2,
  Navigation,
  Radio,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { findShortestPath, haversineDistance } from "../utils/dijkstraRouting";

type ServiceMarker = {
  name: string;
  type: "HOSPITAL" | "AMBULANCE" | "POLICE" | "TOWING" | "RESCUE";
  lat: number;
  lng: number;
  phone?: string;
  address?: string;
};

// Realistic real fallback locations around the target GPS coordinate (12.82739, 77.58999)
const fallbackMarkers: ServiceMarker[] = [
  {
    name: "Kaggalipura Government Hospital",
    type: "HOSPITAL",
    lat: 12.8202,
    lng: 77.5752,
    phone: "+918028435111",
    address: "Kanakapura Rd, Kaggalipura, Karnataka 560082",
  },
  {
    name: "BGS Gleneagles Global Hospital",
    type: "HOSPITAL",
    lat: 12.9023,
    lng: 77.5186,
    phone: "+918026255555",
    address: "Uttarahalli Main Rd, Kengeri, Bengaluru 560060",
  },
  {
    name: "Kaggalipura Police Station",
    type: "POLICE",
    lat: 12.8228,
    lng: 77.576,
    phone: "+918022942547",
    address: "Kaggalipura, Kanakapura Rd, Bengaluru 560082",
  },
  {
    name: "Thalaghattapura Police Station",
    type: "POLICE",
    lat: 12.8712,
    lng: 77.5367,
    phone: "+918028486547",
    address: "Thalaghattapura, Kanakapura Rd, Bengaluru 560109",
  },
  {
    name: "Lifeline Emergency Ambulance Service",
    type: "AMBULANCE",
    lat: 12.835,
    lng: 77.58,
    phone: "+919900029108",
    address: "Near Kaggalipura Junction, Bengaluru",
  },
  {
    name: "Kaggalipura Rescue Unit",
    type: "RESCUE",
    lat: 12.818,
    lng: 77.592,
    phone: "+91101",
    address: "Kanakapura Highway, Bengaluru",
  },
  {
    name: "Sai Motors Car Repair & Towing",
    type: "TOWING",
    lat: 12.83,
    lng: 77.582,
    phone: "+919845012345",
    address: "Kaggalipura Main Road, Bengaluru",
  },
];

const colorMap = {
  HOSPITAL: "#ff1e2d",
  AMBULANCE: "#2563ff",
  POLICE: "#2563ff",
  TOWING: "#22c55e",
  RESCUE: "#f97316",
};

// SVG strings to render in Leaflet DivIcons
const iconSvgs = {
  HOSPITAL: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12M6 12h12M18 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2z"/></svg>`,
  AMBULANCE: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8M19 18h2a1 1 0 0 0 1-1v-4l-3-3h-5v8z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>`,
  POLICE: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/></svg>`,
  TOWING: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8M19 18h2a1 1 0 0 0 1-1v-4l-3-3h-5v8z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>`,
  RESCUE: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  SOS: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  RESPONDER: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`,
};

export function FloatingMap({
  title = "Live Nearby Services",
  className = "",
  showLegend = true,
  userLocation = null,
  sosLocation = null,
  sosActive = false,
  highlightNearestType = null,
  adminLocation = null,
  adminLabel = "Responder",
  onNearestFound,
}: {
  title?: string;
  className?: string;
  showLegend?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
  sosLocation?: { latitude: number; longitude: number } | null;
  sosActive?: boolean;
  highlightNearestType?: "HOSPITAL" | "POLICE" | null;
  /** When set, the map draws a Dijkstra route FROM adminLocation TO userLocation */
  adminLocation?: { latitude: number; longitude: number } | null;
  /** Label shown for the admin responder marker (e.g. "Police Unit", "Ambulance") */
  adminLabel?: string;
  onNearestFound?: (serviceName: string, distanceKm: number) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const adminMarkerRef = useRef<any>(null);
  const activeSosCircleRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  // Route uses 3 layers: glow (outer dim), body (main), pulse (animated overlay)
  const glowPolylineRef = useRef<any>(null);
  const bodyPolylineRef = useRef<any>(null);
  const pulsePolylineRef = useRef<any>(null);
  const activePolylineRef = useRef<any>(null); // kept for fallback straight-line

  const [nearbyServices, setNearbyServices] = useState<ServiceMarker[]>(fallbackMarkers);
  const [selectedService, setSelectedService] = useState<ServiceMarker | null>(fallbackMarkers[0]);
  const [loadingMap, setLoadingMap] = useState(true);

  // Dijkstra states
  const [routingPath, setRoutingPath] = useState<[number, number][]>([]);
  const [routingDistance, setRoutingDistance] = useState<number | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routingStats, setRoutingStats] = useState<{
    duration: number; // in seconds
    executionTimeMs: number;
    isFallback: boolean;
  } | null>(null);

  // Auto-fetched device GPS (silently, without prompt dialogs)
  const [autoGps, setAutoGps] = useState<{ latitude: number; longitude: number } | null>(null);
  const gpsWatchRef = useRef<number | null>(null);

  // Effective coordinates: prefer explicitly passed userLocation, then auto-GPS, then default
  const currentLat = userLocation?.latitude ?? autoGps?.latitude ?? 12.82739;
  const currentLng = userLocation?.longitude ?? autoGps?.longitude ?? 77.58999;

  // Whether admin-to-user routing mode is active
  const isAdminRouteMode = !!adminLocation;

  // 0. Silently acquire GPS on mount (no dialog — browser only shows prompt once)
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    // Only auto-fetch when no userLocation is explicitly provided
    if (userLocation) return;

    const success = (pos: GeolocationPosition) => {
      setAutoGps({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    };
    const error = () => { /* Silently ignore — fallback default coords are used */ };
    const opts: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 };

    // One-shot first fix
    navigator.geolocation.getCurrentPosition(success, error, opts);
    // Keep watching for live updates
    gpsWatchRef.current = navigator.geolocation.watchPosition(success, error, opts);

    return () => {
      if (gpsWatchRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
        gpsWatchRef.current = null;
      }
    };
  }, [userLocation]);

  // Dijkstra Routing Solver Effect
  // MODE A: adminLocation supplied → route admin → user
  // MODE B: normal → route user → nearest service
  useEffect(() => {
    // MODE A: Admin → User routing
    if (isAdminRouteMode) {
      if (!adminLocation) return;
      let active = true;

      const computeAdminRoute = async () => {
        setIsRouting(true);
        try {
          const startPos = { lat: adminLocation.latitude, lng: adminLocation.longitude };
          const endPos = { lat: currentLat, lng: currentLng };
          const result = await findShortestPath(startPos, endPos);

          if (active) {
            setRoutingPath(result.path);
            setRoutingDistance(result.distance);
            setRoutingStats({
              duration: result.duration,
              executionTimeMs: result.executionTimeMs,
              isFallback: result.isFallback,
            });
          }
        } catch (err) {
          console.error("Admin routing error:", err);
          if (active) {
            setRoutingPath([
              [adminLocation.latitude, adminLocation.longitude],
              [currentLat, currentLng],
            ]);
            setRoutingDistance(null);
            setRoutingStats(null);
          }
        } finally {
          if (active) setIsRouting(false);
        }
      };

      computeAdminRoute();
      return () => { active = false; };
    }

    // MODE B: User → nearest service
    if (!selectedService) {
      setRoutingPath([]);
      setRoutingDistance(null);
      setRoutingStats(null);
      return;
    }

    let active = true;
    const computeRoute = async () => {
      setIsRouting(true);
      try {
        const startPos = { lat: currentLat, lng: currentLng };
        const endPos = { lat: selectedService.lat, lng: selectedService.lng };

        const result = await findShortestPath(startPos, endPos);

        if (active) {
          setRoutingPath(result.path);
          setRoutingDistance(result.distance);
          setRoutingStats({
            duration: result.duration,
            executionTimeMs: result.executionTimeMs,
            isFallback: result.isFallback,
          });

          if (
            onNearestFound &&
            highlightNearestType &&
            selectedService.type === highlightNearestType
          ) {
            onNearestFound(selectedService.name, result.distance);
          }
        }
      } catch (err) {
        console.error("Routing error:", err);
        if (active) {
          setRoutingPath([
            [currentLat, currentLng],
            [selectedService.lat, selectedService.lng],
          ]);
          setRoutingDistance(null);
          setRoutingStats(null);
        }
      } finally {
        if (active) setIsRouting(false);
      }
    };

    computeRoute();

    return () => {
      active = false;
    };
  }, [
    isAdminRouteMode,
    adminLocation?.latitude,
    adminLocation?.longitude,
    currentLat,
    currentLng,
    selectedService?.lat,
    selectedService?.lng,
    selectedService?.name,
    onNearestFound,
    highlightNearestType,
  ]);

  // 1. Fetch real emergency services from Overpass API (OpenStreetMap)
  useEffect(() => {
    const fetchOSMData = async () => {
      const query = `
        [out:json][timeout:15];
        (
          node["amenity"="hospital"](around:8000, ${currentLat}, ${currentLng});
          node["amenity"="police"](around:8000, ${currentLat}, ${currentLng});
          node["amenity"="fire_station"](around:8000, ${currentLat}, ${currentLng});
          node["amenity"="car_repair"](around:8000, ${currentLat}, ${currentLng});
        );
        out body 30;
      `;
      try {
        const response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
        );
        if (!response.ok) throw new Error("Overpass API failed");

        const data = await response.json();
        const elements = data.elements || [];

        if (elements.length > 0) {
          const mapped: ServiceMarker[] = elements.map((el: any) => {
            let type: ServiceMarker["type"] = "HOSPITAL";
            if (el.tags.amenity === "police") type = "POLICE";
            else if (el.tags.amenity === "fire_station") type = "RESCUE";
            else if (el.tags.amenity === "car_repair") type = "TOWING";

            // Add simulated phone numbers for real places if they don't have them
            const name = el.tags.name || `${type.replace("_", " ")} Provider`;
            const phone =
              el.tags.phone ||
              el.tags["contact:phone"] ||
              (type === "POLICE" ? "+91100" : type === "HOSPITAL" ? "+91102" : "+919988001122");
            const address =
              el.tags["addr:street"] ||
              el.tags["addr:full"] ||
              `Near coordinates: ${el.lat.toFixed(4)}, ${el.lon.toFixed(4)}`;

            return {
              name,
              type,
              lat: el.lat,
              lng: el.lon,
              phone,
              address,
            };
          });
          setNearbyServices(mapped);
          setSelectedService(mapped[0] || null);
        }
      } catch (err) {
        console.warn("Using high-quality real geolocated fallback list due to Overpass timeout.");
        setNearbyServices(fallbackMarkers);
        setSelectedService(fallbackMarkers[0]);
      }
    };

    fetchOSMData();
  }, [currentLat, currentLng]);

  // 2. Leaflet client-only map initialization
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let L: any;
    let cleanup = () => {};

    // Dynamic import to prevent SSR exceptions
    import("leaflet").then((leafletModule) => {
      L = leafletModule.default;

      // Dynamically load leaflet css
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      // Create map instance
      const map = L.map(mapContainerRef.current!, {
        zoomControl: false,
        attributionControl: false,
      }).setView([currentLat, currentLng], 14);

      mapRef.current = map;

      // Dark Mode Tiles (Inverted OSM Tiles via CSS Filters)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Add a scale control
      L.control.scale({ position: "bottomright" }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      setLoadingMap(false);

      cleanup = () => {
        map.remove();
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    });

    return () => cleanup();
  }, []);

  // 3. Update map center and markers dynamically
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loadingMap) return;

    import("leaflet").then((LModule) => {
      const L = LModule.default;
      const map = mapRef.current;

      // Clear previous markers
      markersGroupRef.current.clearLayers();

      // Recenter Map: if admin mode, fit both points; otherwise user location
      if (isAdminRouteMode && adminLocation) {
        map.fitBounds(
          [
            [adminLocation.latitude, adminLocation.longitude],
            [currentLat, currentLng],
          ],
          { padding: [60, 60] },
        );
      } else {
        map.setView([currentLat, currentLng], 14);
      }

      // User / SOS pin DivIcon
      const userIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-10 w-10 rounded-full animate-ping opacity-60" style="background-color: ${sosActive ? "#ff1e2d" : "#2563ff"};"></span>
            <div class="h-10 w-10 rounded-full flex items-center justify-center text-white border-2 border-white shadow-2xl" style="background-color: ${sosActive ? "#ff1e2d" : "#2563ff"}; box-shadow: 0 0 25px ${sosActive ? "#ff1e2d" : "#2563ff"};">
              ${sosActive ? iconSvgs.SOS : `<div class="h-3 w-3 rounded-full bg-white animate-pulse"></div>`}
            </div>
          </div>
        `,
        className: "custom-user-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Clear previous user/sos/admin layers
      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
      if (adminMarkerRef.current) { map.removeLayer(adminMarkerRef.current); adminMarkerRef.current = null; }
      if (activeSosCircleRef.current) map.removeLayer(activeSosCircleRef.current);
      // Remove all 3 route layers
      if (glowPolylineRef.current) { map.removeLayer(glowPolylineRef.current); glowPolylineRef.current = null; }
      if (bodyPolylineRef.current) { map.removeLayer(bodyPolylineRef.current); bodyPolylineRef.current = null; }
      if (pulsePolylineRef.current) { map.removeLayer(pulsePolylineRef.current); pulsePolylineRef.current = null; }
      if (activePolylineRef.current) {
        map.removeLayer(activePolylineRef.current);
        activePolylineRef.current = null;
      }

      // Add User location marker
      userMarkerRef.current = L.marker([currentLat, currentLng], { icon: userIcon })
        .addTo(map)
        .bindPopup(sosActive ? "🚨 ACTIVE SOS TRANSMISSION BEACON" : "Your GPS Coordinates Locked");

      // Add Admin / Responder location marker (green pulsing pin)
      if (isAdminRouteMode && adminLocation) {
        const adminIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute inline-flex h-12 w-12 rounded-full animate-ping opacity-40" style="background-color:#22c55e;"></span>
              <span class="absolute inline-flex h-8 w-8 rounded-full animate-ping opacity-30" style="background-color:#22c55e; animation-delay:0.4s;"></span>
              <div class="h-11 w-11 rounded-full flex items-center justify-center text-white border-2 border-white shadow-2xl z-10" style="background-color:#15803d; box-shadow: 0 0 28px #22c55e;">
                ${iconSvgs.RESPONDER}
              </div>
            </div>
          `,
          className: "custom-admin-marker",
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        adminMarkerRef.current = L.marker(
          [adminLocation.latitude, adminLocation.longitude],
          { icon: adminIcon }
        )
          .addTo(map)
          .bindPopup(`<strong style="color:#22c55e;">🚑 ${adminLabel}</strong><br/><span style="font-size:11px;">Dispatched responder — en route to user</span>`);
      }

      // Draw SOS active radius ring
      if (sosActive) {
        activeSosCircleRef.current = L.circle([currentLat, currentLng], {
          color: "#ff1e2d",
          fillColor: "#ff1e2d",
          fillOpacity: 0.12,
          radius: 500,
          weight: 2,
        }).addTo(map);

        // Only fit to SOS ring if NOT in admin route mode (admin mode already fitBounds)
        if (!isAdminRouteMode) {
          map.fitBounds(activeSosCircleRef.current.getBounds(), { padding: [20, 20] });
        }
      }

      // Calculate distance helper
      const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371; // km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      // Find nearest service of requested type
      let nearestService: ServiceMarker | null = null;
      let minDistance = Infinity;

      if (highlightNearestType) {
        for (const service of nearbyServices) {
          if (service.type === highlightNearestType) {
            const dist = getDistance(currentLat, currentLng, service.lat, service.lng);
            if (dist < minDistance) {
              minDistance = dist;
              nearestService = service;
            }
          }
        }
      }

      // ──────────────────────────────────────────────────────────────────
      // Draw Google Maps-style glowing road route (3 layered polylines)
      // ──────────────────────────────────────────────────────────────────
      const drawGlowRoute = (path: [number, number][], color: string) => {
        // Layer 1 — wide outer glow (translucent, blurred via opacity trick)
        glowPolylineRef.current = L.polyline(path, {
          color: color,
          weight: 18,
          opacity: 0.18,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false,
        }).addTo(map);

        // Layer 2 — mid glow halo
        L.polyline(path, {
          color: color,
          weight: 10,
          opacity: 0.28,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false,
        }).addTo(markersGroupRef.current);

        // Layer 3 — solid bright body (the main route line)
        bodyPolylineRef.current = L.polyline(path, {
          color: color,
          weight: 5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false,
        }).addTo(map);

        // Layer 4 — animated marching pulse overlay (Google Maps flow arrows)
        pulsePolylineRef.current = L.polyline(path, {
          color: '#ffffff',
          weight: 3,
          opacity: 0.55,
          dashArray: '12 18',
          dashOffset: '0',
          lineCap: 'round',
          lineJoin: 'round',
          className: 'route-flow-pulse',
          interactive: false,
        }).addTo(map);
      };

      // Draw polyline along the Dijkstra road path
      if (routingPath.length > 0) {
        const routeColor = isAdminRouteMode
          ? '#22c55e'  // Green for admin→user route
          : colorMap[(selectedService?.type as keyof typeof colorMap) ?? 'HOSPITAL'] || '#ff1e2d';

        drawGlowRoute(routingPath, routeColor);

        // Fit map bounds to show entire road route
        if (!isAdminRouteMode) {
          const bounds = L.latLngBounds(routingPath);
          map.fitBounds(bounds, { padding: [55, 55] });
        }

        // Draw clean road-node waypoint dots (smaller, cleaner)
        if (routingPath.length > 2) {
          routingPath.forEach((pt, index) => {
            if (index > 0 && index < routingPath.length - 1 && index % 3 === 0) {
              L.circleMarker(pt, {
                radius: 2.5,
                fillColor: '#ffffff',
                color: routeColor,
                weight: 1,
                fillOpacity: 0.9,
                opacity: 0.6,
                interactive: false,
              }).addTo(markersGroupRef.current);
            }
          });
        }
      } else if (!isAdminRouteMode && nearestService) {
        // Fallback straight-line with subtle glow while Dijkstra is calculating
        const fbColor = colorMap[nearestService.type as keyof typeof colorMap];
        // Glow halo
        L.polyline(
          [[currentLat, currentLng], [nearestService.lat, nearestService.lng]],
          { color: fbColor, weight: 14, opacity: 0.15, lineCap: 'round', interactive: false },
        ).addTo(markersGroupRef.current);
        // Dashed body
        activePolylineRef.current = L.polyline(
          [[currentLat, currentLng], [nearestService.lat, nearestService.lng]],
          {
            color: fbColor,
            weight: 3.5,
            dashArray: '8 12',
            opacity: 0.6,
            className: 'route-flow-pulse',
          },
        ).addTo(map);

        const bounds = L.latLngBounds([
          [currentLat, currentLng],
          [nearestService.lat, nearestService.lng],
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      // Update selected service state safely without loop
      if (nearestService && (!selectedService || selectedService.name !== nearestService.name)) {
        setSelectedService(nearestService);
      }

      // Add Service markers
      nearbyServices.forEach((service) => {
        const color = colorMap[service.type];
        const iconHtml = iconSvgs[service.type];

        const markerIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center group">
              <div class="absolute inset-0 rounded-full animate-pulse opacity-20" style="background-color: ${color};"></div>
              <div class="h-8 w-8 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md transition-all hover:scale-110" style="background-color: ${color}; box-shadow: 0 0 10px ${color}80;">
                ${iconHtml}
              </div>
            </div>
          `,
          className: "custom-service-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const serviceMarker = L.marker([service.lat, service.lng], { icon: markerIcon }).addTo(
          markersGroupRef.current,
        ).bindPopup(`
            <div class="text-xs p-1 text-slate-900 dark:text-slate-100">
              <strong style="color: ${color}; font-size: 13px;">${service.name}</strong>
              <div style="margin-top: 4px; font-weight: 500;">Type: ${service.type}</div>
              ${service.address ? `<div style="color: #64748b; margin-top: 2px;">${service.address}</div>` : ""}
              ${service.phone ? `<div style="margin-top: 4px; font-weight: 600;">📞 ${service.phone}</div>` : ""}
            </div>
          `);

        serviceMarker.on("click", () => {
          setSelectedService(service);
        });
      });
    });
  }, [
    nearbyServices,
    currentLat,
    currentLng,
    sosActive,
    loadingMap,
    highlightNearestType,
    routingPath,
    selectedService,
    isAdminRouteMode,
    adminLocation?.latitude,
    adminLocation?.longitude,
    adminLabel,
    autoGps?.latitude,
    autoGps?.longitude,
  ]);

  // Leaflet Map Zoom Handlers
  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };
  const handleRecenter = () => {
    if (mapRef.current) mapRef.current.setView([currentLat, currentLng], 14);
  };

  return (
    <div className={`relative glass-card rounded-3xl overflow-hidden ${className}`}>
      {/* Header controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-sm font-semibold">
        <span
          className={`h-2.5 w-2.5 rounded-full ${sosActive ? "bg-brand-red animate-ping" : "bg-brand-blue animate-pulse"}`}
        />
        {sosActive ? (
          <span className="text-brand-red uppercase tracking-wider font-extrabold animate-pulse bg-brand-red/10 px-3 py-1 rounded-full border border-brand-red/35">
            🚨 Live SOS Signal Transmitting
          </span>
        ) : (
          <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white/90 border border-white/10">
            {title}
          </span>
        )}
      </div>

      {showLegend && (
        <div className="absolute top-16 left-4 z-10 glass-card rounded-2xl p-3 space-y-2 hidden sm:block bg-black/60 backdrop-blur-md border border-white/10">
          {[
            { Icon: Hospital, label: "Hospital", color: "HOSPITAL" as const },
            { Icon: Ambulance, label: "Ambulance", color: "AMBULANCE" as const },
            { Icon: Shield, label: "Police Station", color: "POLICE" as const },
            { Icon: Truck, label: "Towing", color: "TOWING" as const },
            { Icon: Users, label: "Rescue Team", color: "RESCUE" as const },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2 text-xs">
              <div
                className="h-6 w-6 rounded-md flex items-center justify-center"
                style={{ background: colorMap[l.color] + "30", color: colorMap[l.color] }}
              >
                <l.Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-white/80 font-medium">{l.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Map Control Buttons */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          title="Recenter Map"
          className="h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md flex items-center justify-center transition-all"
        >
          <Locate className="h-4 w-4" />
        </button>
        <div className="rounded-full bg-black/60 border border-white/10 overflow-hidden backdrop-blur-md flex flex-col">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="h-9 w-9 flex items-center justify-center text-white hover:bg-white/10 transition-colors border-b border-white/10"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="h-9 w-9 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-full min-h-[350px] relative bg-[#0a1024] select-none">
        {/* Leaflet DOM Node */}
        <div
          ref={mapContainerRef}
          className="w-full h-full dark-map-leaflet absolute inset-0 z-0"
        />

        {loadingMap && (
          <div className="absolute inset-0 bg-[#0a1024] z-20 flex flex-col justify-center items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-red"></div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest animate-pulse">
              Initializing OSMap Tiles...
            </div>
          </div>
        )}
      </div>

      {/* OSRM Route ETA Floating Badge (Google Maps Style) */}
      {routingStats && !isRouting && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none mt-10">
          <div className="bg-[#1a73e8] text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-xl flex items-center gap-1.5 border-2 border-white">
            <span>{Math.ceil(routingStats.duration / 60)} min</span>
            {routingStats.isFallback ? (
              <span className="text-[10px] text-white/70">Straight Line</span>
            ) : null}
          </div>
        </div>
      )}

      {/* Legacy Dijkstra Telemetry Panel (Replaced by clean ETA badge, keeping for dev/stats if needed, or we can just simplify it) */}
      {routingStats && (selectedService || isAdminRouteMode) && (
        <div className="absolute bottom-[96px] left-4 right-4 z-10 max-w-md mx-auto hidden lg:block">
          <div className="glass-card rounded-2xl p-3.5 bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-between text-xs text-left shadow-2xl">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                isAdminRouteMode
                  ? "bg-brand-green/10 border border-brand-green/30 text-brand-green"
                  : "bg-brand-green/10 border border-brand-green/30 text-brand-green"
              }`}>
                {isRouting ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : isAdminRouteMode ? (
                  <Navigation className="h-4.5 w-4.5 animate-pulse" />
                ) : (
                  <Cpu className="h-4.5 w-4.5 animate-pulse" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[10px] tracking-wider uppercase text-brand-green">
                    {isAdminRouteMode ? `${adminLabel} → You` : "OSRM Routing Engine"}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
                </div>
                <div className="text-white font-bold text-xs mt-0.5">
                  {routingStats.isFallback ? "Grid Road Net" : "OSM Highway Network"} • {routingStats.executionTimeMs}ms
                </div>
                <div className="text-[10px] text-white/50 mt-0.5 font-medium">
                  ETA:{" "}
                  <span className="font-mono text-white/70">
                    {Math.ceil(routingStats.duration / 60)} minutes
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-bold text-white leading-none">
                {isAdminRouteMode ? "DISPATCH DIST" : "ROAD DISTANCE"}
              </div>
              <div className="text-lg font-black text-brand-green mt-0.5 leading-none font-mono">
                {routingDistance !== null ? `${routingDistance} km` : "Calc..."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Route Mode: Responder En-Route Card */}
      {isAdminRouteMode && adminLocation && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="glass-card rounded-2xl p-4 bg-black/70 backdrop-blur-md border border-brand-green/20 flex items-center justify-between gap-4 max-w-md mx-auto shadow-[0_0_20px_rgba(34,197,94,0.15)]">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg"
                style={{ backgroundColor: "#15803d", boxShadow: "0 0 18px #22c55e" }}
              >
                <Navigation className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-white truncate flex items-center gap-2">
                  {adminLabel}
                  <span className="text-[9px] bg-brand-green/20 text-brand-green border border-brand-green/30 px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider animate-pulse">
                    En Route
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Dispatched responder — tracking via OSM roads
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {routingDistance !== null && (
                    <span className="text-[9px] text-brand-green font-bold bg-brand-green/10 px-1.5 py-0.5 rounded border border-brand-green/20">
                      🛣️ Road: {routingDistance} km away
                    </span>
                  )}
                  {isRouting && (
                    <span className="text-[9px] text-white/40 italic">calculating route…</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <Radio className="h-5 w-5 text-brand-green animate-pulse" />
              <span className="text-[9px] text-brand-green font-bold uppercase">Live</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Provider Overlay (non-admin mode) */}
      {!isAdminRouteMode && selectedService && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="glass-card rounded-2xl p-4 bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-between gap-4 max-w-md mx-auto">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg"
                style={{
                  backgroundColor: colorMap[selectedService.type],
                  boxShadow: `0 0 15px ${colorMap[selectedService.type]}`,
                }}
              >
                {selectedService.type === "HOSPITAL" && <Hospital className="h-4.5 w-4.5" />}
                {selectedService.type === "AMBULANCE" && <Ambulance className="h-4.5 w-4.5" />}
                {selectedService.type === "POLICE" && <Shield className="h-4.5 w-4.5" />}
                {selectedService.type === "TOWING" && <Truck className="h-4.5 w-4.5" />}
                {selectedService.type === "RESCUE" && <Users className="h-4.5 w-4.5" />}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-white truncate">{selectedService.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {selectedService.address || "Bangalore, India"}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {selectedService.phone && (
                    <span className="text-[10px] text-brand-blue font-bold font-mono">
                      {selectedService.phone}
                    </span>
                  )}
                  {routingDistance !== null && (
                    <span className="text-[9px] text-brand-green font-bold bg-brand-green/10 px-1.5 py-0.2 rounded border border-brand-green/20">
                      🛣️ Road: {routingDistance} km
                    </span>
                  )}
                </div>
              </div>
            </div>
            <a
              href={`tel:${selectedService.phone || "+91112"}`}
              className="px-4 py-2 bg-brand-red/90 hover:bg-brand-red text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_10px_rgba(255,30,45,0.3)] shrink-0"
            >
              CALL
            </a>
          </div>
        </div>
      )}

      {/* Leaflet CSS Dark Filter + Glowing Route Animations */}
      <style>{`
        .dark-map-leaflet .leaflet-tile-pane {
          filter: invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%) saturate(60%) !important;
        }
        .leaflet-container {
          background-color: #0b0f19 !important;
          font-family: inherit !important;
        }
        .leaflet-popup-content-wrapper {
          background-color: #0d121e !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
        }
        .leaflet-popup-tip {
          background-color: #0d121e !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .leaflet-popup-content {
          margin: 10px !important;
        }

        /* ── Google Maps-style marching flow arrows ── */
        .route-flow-pulse {
          animation: route-march 1.6s linear infinite !important;
          will-change: stroke-dashoffset;
        }
        @keyframes route-march {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -40; }
        }

        /* ── Outer glow pulse (breathe in/out) ── */
        .leaflet-interactive.glow-outer {
          animation: glow-breathe 2.4s ease-in-out infinite alternate !important;
        }
        @keyframes glow-breathe {
          from { opacity: 0.12; }
          to   { opacity: 0.32; }
        }

        /* ── Animate-dash (legacy fallback) ── */
        .animate-dash-route {
          animation: leaflet-dash-march 2s linear infinite !important;
        }
        @keyframes leaflet-dash-march {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -20; }
        }
      `}</style>
    </div>
  );
}
