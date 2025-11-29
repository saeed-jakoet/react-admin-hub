import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import { User, MapPin, RefreshCw } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useSWR from "swr";
import { get } from "@/lib/api/fetcher";

// Fetcher for staff locations
const locationFetcher = async () => {
    const response = await get("/staff/locations");
    if (response?.status === "success" && response.data?.locations) {
        return response.data.locations.map((loc) => ({
            id: loc.id,
            name: `${loc.first_name || ""} ${loc.last_name || ""}`.trim() || "Unknown",
            position: { lat: loc.latitude, lng: loc.longitude },
            status: loc.location_updated_at && 
                    new Date(loc.location_updated_at) > new Date(Date.now() - 10 * 60 * 1000) 
                    ? "Active" : "Idle", // Active if updated in last 10 minutes
            lastUpdate: loc.location_updated_at 
                ? formatTimeAgo(new Date(loc.location_updated_at)) 
                : "Unknown",
            role: loc.role || "technician",
        }));
    }
    return [];
};

// Helper to format time ago
const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} days ago`;
};

// Custom marker icon using Lucide User icon
const createCustomIcon = (status) => {
    const color = status === "Active" ? "#3b82f6" : "#f59e0b";
    const bgColor = status === "Active" ? "#d1fae5" : "#fef3c7";

    const svgIcon = `
    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-${status}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.4"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Outer glow circle -->
      <circle cx="24" cy="24" r="20" fill="${bgColor}" opacity="0.5"/>
      <!-- Main circle -->
      <circle cx="24" cy="24" r="16" fill="white" filter="url(#shadow-${status})"/>
      <circle cx="24" cy="24" r="14" fill="${color}"/>
      <!-- User icon -->
      <g transform="translate(24, 24)">
        <circle cx="0" cy="-3" r="4" fill="white"/>
        <path d="M -6 6 Q -6 2 0 2 Q 6 2 6 6 L 6 8 L -6 8 Z" fill="white"/>
      </g>
    </svg>
  `;

    return new L.Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -24],
    });
};

export default function MapView() {
    const capeTown = [-33.9249, 18.4241];
    
    // Fetch real technician locations, poll every 30 seconds
    const { data: technicians, error, isLoading, mutate } = useSWR(
        "staff-locations",
        locationFetcher,
        { refreshInterval: 30000 }
    );

    // Count active vs idle technicians
    const activeCount = technicians?.filter(t => t.status === "Active").length || 0;
    const idleCount = technicians?.filter(t => t.status === "Idle").length || 0;

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden">
            {/* Status overlay */}
            <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-slate-200 dark:border-slate-700">
                {/* <div className="flex items-center gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">{activeCount}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Active</div>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-amber-500">{idleCount}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Idle</div>
                    </div>
                    <button 
                        onClick={() => mutate()}
                        className="ml-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Refresh locations"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div> */}
                {error && (
                    <div className="mt-2 text-xs text-red-500">Failed to load locations</div>
                )}
            </div>

            {/* Empty state overlay when no technicians have locations */}
            {!isLoading && (!technicians || technicians.length === 0) && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <div className="text-slate-600 dark:text-slate-400">No technicians with location data</div>
                    <div className="text-xs text-slate-400 mt-1">Technicians will appear here once they share their location</div>
                </div>
            )}

            <MapContainer
                center={capeTown}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
                zoomControl={true}
                scrollWheelZoom={true}
            >
                {/* Light CartoDB Positron style - clean and readable */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={20}
                />

                {technicians && technicians.map((tech) => (
                    <Marker
                        key={tech.id}
                        position={tech.position}
                        icon={createCustomIcon(tech.status)}
                    >
                        {/* Tooltip on hover */}
                        <Tooltip
                            direction="top"
                            offset={[0, -24]}
                            opacity={1}
                            permanent={false}
                        >
                            <div className="space-y-1">
                                <div className="font-semibold text-sm">{tech.name}</div>
                                <div className="text-xs text-slate-500">{tech.role}</div>
                                <div className="text-xs text-slate-400">Updated: {tech.lastUpdate}</div>
                            </div>
                        </Tooltip>
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-full ${
                                        tech.status === "Active" ? "bg-blue-100" : "bg-amber-100"
                                    }`}>
                                        <User className={`w-5 h-5 ${
                                            tech.status === "Active" ? "text-blue-600" : "text-amber-600"
                                        }`} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-slate-900">{tech.name}</div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            tech.status === "Active" 
                                                ? "bg-blue-100 text-blue-800" 
                                                : "bg-amber-100 text-amber-800"
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                tech.status === "Active" ? "bg-blue-500" : "bg-amber-500"
                                            }`}></span>
                                            {tech.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{tech.position.lat.toFixed(4)}, {tech.position.lng.toFixed(4)}</span>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        Last updated: {tech.lastUpdate}
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <style jsx global>{`
                /* Tooltip styling */
                .leaflet-tooltip {
                    background-color: rgba(15, 23, 42, 0.95) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 8px !important;
                    color: white !important;
                    padding: 6px 12px !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
                }
                
                .leaflet-tooltip-top:before {
                    border-top-color: rgba(15, 23, 42, 0.95) !important;
                }
                
                /* Ensure no scrolling on body/html */
                html, body {
                    overflow: hidden !important;
                    height: 100%;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                }
                
                .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }
                
                .leaflet-popup-content {
                    margin: 8px;
                }
                
                .leaflet-container {
                    font-family: inherit;
                    background: #f8f9fa;
                }
                
                .leaflet-control-zoom {
                    border: none !important;
                    border-radius: 10px !important;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
                }
                
                .leaflet-control-zoom a {
                    width: 32px !important;
                    height: 32px !important;
                    line-height: 32px !important;
                    font-size: 18px !important;
                    border: none !important;
                    background: white !important;
                    color: #334155 !important;
                }
                
                .leaflet-control-zoom a:hover {
                    background-color: #f1f5f9 !important;
                }
                
                .leaflet-control-zoom-in {
                    border-bottom: 1px solid #e2e8f0 !important;
                }
                
                /* Responsive adjustments */
                @media (max-width: 640px) {
                    .leaflet-control-zoom a {
                        width: 28px !important;
                        height: 28px !important;
                        line-height: 28px !important;
                        font-size: 16px !important;
                    }
                    
                    .leaflet-popup-content-wrapper {
                        max-width: calc(100vw - 60px) !important;
                    }
                }
                
                /* Hide attribution */
                .leaflet-control-attribution {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
