import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import { User, MapPin, RefreshCw, Search, Filter, Layers, Navigation, Clock, Zap, Signal, ChevronDown, X, Phone, Mail, Compass, Target, Activity, Users, Map as MapIcon, Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useSWR from "swr";
import { get } from "@/lib/api/fetcher";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// Optimized map style configurations - using faster CDN-backed providers
const MAP_STYLES = {
    voyager: {
        name: "Voyager",
        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        attribution: '&copy; CARTO',
        subdomains: "abcd",
    },
    light: {
        name: "Light", 
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        attribution: '&copy; CARTO',
        subdomains: "abcd",
    },
    dark: {
        name: "Dark",
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        attribution: '&copy; CARTO',
        subdomains: "abcd",
    },
    satellite: {
        name: "Satellite",
        // Using Esri's cached tile server - much faster than raw imagery
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: '&copy; Esri',
        subdomains: undefined,
    },
    streets: {
        name: "Streets",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; OSM',
        subdomains: "abc",
    }
};

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
                ? "Active" : "Idle",
            lastUpdate: loc.location_updated_at
                ? formatTimeAgo(new Date(loc.location_updated_at))
                : "Unknown",
            lastUpdateRaw: loc.location_updated_at ? new Date(loc.location_updated_at) : null,
            role: loc.role || "technician",
            phone: loc.phone || null,
            email: loc.email || null,
        }));
    }
    return [];
};

// Helper to format time ago
const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};

// Animated custom marker with pulse effect
const createAnimatedIcon = (status, isSelected = false) => {
    const colors = {
        Active: { primary: "#10b981", secondary: "#34d399", glow: "#6ee7b7", bg: "#ecfdf5" },
        Idle: { primary: "#f59e0b", secondary: "#fbbf24", glow: "#fcd34d", bg: "#fffbeb" },
        Offline: { primary: "#6b7280", secondary: "#9ca3af", glow: "#d1d5db", bg: "#f3f4f6" }
    };
    const c = colors[status] || colors.Offline;
    const size = isSelected ? 64 : 52;
    const scale = isSelected ? 1.2 : 1;

    const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${status}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${c.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${c.secondary};stop-opacity:1" />
        </linearGradient>
        <filter id="glow-${status}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="shadow-${status}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.25)"/>
        </filter>
      </defs>
      
      <!-- Animated pulse rings -->
      <circle cx="32" cy="32" r="28" fill="none" stroke="${c.glow}" stroke-width="2" opacity="0.3">
        <animate attributeName="r" values="20;30;20" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="32" cy="32" r="24" fill="none" stroke="${c.secondary}" stroke-width="1.5" opacity="0.4">
        <animate attributeName="r" values="16;26;16" dur="2s" repeatCount="indefinite" begin="0.5s"/>
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" begin="0.5s"/>
      </circle>
      
      <!-- Outer ring -->
      <circle cx="32" cy="32" r="22" fill="${c.bg}" filter="url(#shadow-${status})"/>
      
      <!-- Main gradient circle -->
      <circle cx="32" cy="32" r="18" fill="url(#grad-${status})" filter="url(#glow-${status})"/>
      
      <!-- Inner white ring -->
      <circle cx="32" cy="32" r="15" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      
      <!-- User icon -->
      <g transform="translate(32, 32)" fill="white">
        <circle cx="0" cy="-4" r="5" opacity="0.95"/>
        <path d="M -8 7 Q -8 1 0 1 Q 8 1 8 7 L 8 10 Q 8 12 6 12 L -6 12 Q -8 12 -8 10 Z" opacity="0.95"/>
      </g>
      
      <!-- Status indicator dot -->
      <circle cx="44" cy="20" r="6" fill="white" stroke="${c.primary}" stroke-width="2"/>
      <circle cx="44" cy="20" r="3" fill="${status === 'Active' ? '#10b981' : status === 'Idle' ? '#f59e0b' : '#6b7280'}">
        ${status === 'Active' ? '<animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>' : ''}
      </circle>
    </svg>
  `;

    return new L.Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
        popupAnchor: [0, -size/2 + 8],
        className: isSelected ? 'selected-marker' : '',
    });
};

// Reverse geocode hook
function useReverseGeocode(lat, lng) {
    const [vicinity, setVicinity] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!lat || !lng) return;
        setLoading(true);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
                const area = data.address?.suburb || data.address?.city || data.address?.town || data.address?.village || data.display_name;
                setVicinity(area || "Unknown area");
            })
            .catch(() => setVicinity("Unknown area"))
            .finally(() => setLoading(false));
    }, [lat, lng]);

    return [vicinity, loading];
}

// Enhanced popup component
function EnhancedPopup({ tech }) {
    const [vicinity, loading] = useReverseGeocode(tech.position.lat, tech.position.lng);
    const statusColors = {
        Active: { bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500", border: "border-emerald-500/30" },
        Idle: { bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500", border: "border-amber-500/30" },
        Offline: { bg: "bg-slate-500/10", text: "text-slate-600", dot: "bg-slate-500", border: "border-slate-500/30" }
    };
    const sc = statusColors[tech.status] || statusColors.Offline;

    return (
        <div className="min-w-[280px] p-0 -m-2">
            {/* Header with gradient */}
            <div className={`relative overflow-hidden rounded-t-lg p-4 ${tech.status === 'Active' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : tech.status === 'Idle' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-slate-500 to-slate-700'}`}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
                <div className="relative flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">{tech.name}</h3>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                            <span className={`w-2 h-2 rounded-full ${tech.status === 'Active' ? 'bg-white animate-pulse' : 'bg-white/70'}`}></span>
                            {tech.status}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                {/* Location */}
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Current Location</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                            {loading ? "Locating..." : vicinity}
                        </p>
                    </div>
                </div>

                {/* Last Update */}
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Last Updated</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{tech.lastUpdate}</p>
                    </div>
                </div>

                {/* Coordinates */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-mono">{tech.position.lat.toFixed(6)}, {tech.position.lng.toFixed(6)}</span>
                    <Compass className="w-3.5 h-3.5" />
                </div>
            </div>
        </div>
    );
}

// Map style selector component
function MapStyleSelector({ currentStyle, onStyleChange, isOpen, onToggle }) {
    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
            >
                <Layers className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{MAP_STYLES[currentStyle].name}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden min-w-[180px] z-50">
                    {Object.entries(MAP_STYLES).map(([key, style]) => (
                        <button
                            key={key}
                            onClick={() => { onStyleChange(key); onToggle(); }}
                            className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${currentStyle === key ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${currentStyle === key ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                            {style.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Search/Filter panel
function SearchFilterPanel({ searchTerm, onSearchChange, statusFilter, onStatusFilterChange, technicians }) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search technicians..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                {searchTerm && (
                    <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    </button>
                )}
            </div>
            
            {/* Filter Chips */}
            <div className="flex gap-2">
                {['All', 'Active', 'Idle'].map(status => (
                    <button
                        key={status}
                        onClick={() => onStatusFilterChange(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                            statusFilter === status 
                                ? status === 'Active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : status === 'Idle' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {status}
                        {status !== 'All' && (
                            <span className="ml-1.5 opacity-70">
                                ({technicians?.filter(t => t.status === status).length || 0})
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Fly to location component
function FlyToLocation({ position, zoom = 16 }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, zoom, { duration: 1.5 });
        }
    }, [position, zoom, map]);
    return null;
}

// Cached tile layers component - keeps all layers loaded but only shows active one
function CachedTileLayers({ activeStyle, onLoadStart, onLoadEnd }) {
    const loadingRef = useRef({});
    const [loadedStyles, setLoadedStyles] = useState(new Set(['voyager']));
    
    const handleTileLoad = useCallback((styleKey) => {
        setLoadedStyles(prev => new Set([...prev, styleKey]));
        if (loadingRef.current[styleKey]) {
            loadingRef.current[styleKey] = false;
            onLoadEnd?.();
        }
    }, [onLoadEnd]);
    
    const handleTileLoadStart = useCallback((styleKey) => {
        if (!loadedStyles.has(styleKey)) {
            loadingRef.current[styleKey] = true;
            onLoadStart?.();
        }
    }, [loadedStyles, onLoadStart]);

    return (
        <>
            {Object.entries(MAP_STYLES).map(([key, style]) => (
                <TileLayer
                    key={key}
                    attribution={style.attribution}
                    url={style.url}
                    {...(style.subdomains ? { subdomains: style.subdomains } : {})}
                    maxZoom={19}
                    noWrap={true}
                    opacity={activeStyle === key ? 1 : 0}
                    className={activeStyle === key ? '' : 'pointer-events-none'}
                    eventHandlers={{
                        loading: () => handleTileLoadStart(key),
                        load: () => handleTileLoad(key),
                    }}
                    // Performance optimizations
                    updateWhenIdle={true}
                    updateWhenZooming={false}
                    keepBuffer={2}
                />
            ))}
        </>
    );
}

// Technician list panel
function TechnicianListPanel({ technicians, selectedTech, onSelectTech, isOpen, onToggle }) {
    if (!isOpen) return null;
    
    return (
        <div className="absolute left-6 top-28 bottom-24 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden z-[1000] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-white">Team Members</h3>
                </div>
                <button onClick={onToggle} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {technicians?.map(tech => (
                    <button
                        key={tech.id}
                        onClick={() => onSelectTech(tech)}
                        className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                            selectedTech?.id === tech.id 
                                ? 'bg-blue-500 text-white shadow-lg' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            selectedTech?.id === tech.id 
                                ? 'bg-white/20' 
                                : tech.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                        }`}>
                            <User className={`w-5 h-5 ${
                                selectedTech?.id === tech.id 
                                    ? 'text-white' 
                                    : tech.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'
                            }`} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className={`font-medium text-sm ${selectedTech?.id === tech.id ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                                {tech.name}
                            </p>
                            <p className={`text-xs ${selectedTech?.id === tech.id ? 'text-white/70' : 'text-slate-500'}`}>
                                {tech.lastUpdate}
                            </p>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full ${
                            tech.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                        } ${tech.status === 'Active' && selectedTech?.id !== tech.id ? 'animate-pulse' : ''}`}></div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function MapView() {
    const capeTown = [-33.9249, 18.4241];
    const [mapStyle, setMapStyle] = useState('voyager');
    const [styleMenuOpen, setStyleMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedTech, setSelectedTech] = useState(null);
    const [listPanelOpen, setListPanelOpen] = useState(false);
    const [flyToPosition, setFlyToPosition] = useState(null);
    const [tilesLoading, setTilesLoading] = useState(false);

    // Fetch real technician locations, poll every 30 seconds
    const { data: technicians, error, isLoading, mutate } = useSWR(
        "staff-locations",
        locationFetcher,
        { refreshInterval: 30000 }
    );

    // Filtered technicians
    const filteredTechnicians = useMemo(() => {
        if (!technicians) return [];
        return technicians.filter(tech => {
            const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || tech.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [technicians, searchTerm, statusFilter]);

    // Count active vs idle technicians
    const activeCount = technicians?.filter(t => t.status === "Active").length || 0;
    const idleCount = technicians?.filter(t => t.status === "Idle").length || 0;
    const totalCount = technicians?.length || 0;

    // Handle technician selection
    const handleSelectTech = (tech) => {
        setSelectedTech(tech);
        setFlyToPosition([tech.position.lat, tech.position.lng]);
    };
    
    // Handle map style change with loading state
    const handleStyleChange = useCallback((newStyle) => {
        setTilesLoading(true);
        setMapStyle(newStyle);
        // Auto-clear loading after a timeout in case tiles are cached
        setTimeout(() => setTilesLoading(false), 1500);
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-100 dark:bg-slate-900">
            {/* Tile loading overlay */}
            {tilesLoading && (
                <div className="absolute inset-0 z-[999] bg-black/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <div className="bg-white/95 dark:bg-slate-800/95 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Loading map tiles...</span>
                    </div>
                </div>
            )}
            
            {/* Top Controls Bar */}
            <div className="absolute top-6 left-6 right-6 z-[1000] flex items-start justify-between gap-4">
                {/* Left side - Search & Filters */}
                <div className="flex flex-col gap-3">
                    <SearchFilterPanel
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        technicians={technicians}
                    />
                </div>
                
                {/* Right side - Map style & Actions */}
                <div className="flex items-center gap-3">
                    <MapStyleSelector
                        currentStyle={mapStyle}
                        onStyleChange={handleStyleChange}
                        isOpen={styleMenuOpen}
                        onToggle={() => setStyleMenuOpen(!styleMenuOpen)}
                    />
                    <button
                        onClick={() => setListPanelOpen(!listPanelOpen)}
                        className={`p-2.5 rounded-xl shadow-lg border transition-all duration-200 ${
                            listPanelOpen 
                                ? 'bg-blue-500 text-white border-blue-500' 
                                : 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                        title="Toggle team list"
                    >
                        <Users className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Technician List Panel */}
            <TechnicianListPanel
                technicians={filteredTechnicians}
                selectedTech={selectedTech}
                onSelectTech={handleSelectTech}
                isOpen={listPanelOpen}
                onToggle={() => setListPanelOpen(false)}
            />

            {/* Stats Panel - Bottom Right */}
            <div className="absolute bottom-6 right-6 z-[1000]">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-5 min-w-[200px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold text-slate-800 dark:text-white">Live Status</span>
                        </div>
                        <button 
                            onClick={() => mutate()}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                            title="Refresh locations"
                        >
                            <RefreshCw className={`w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30">
                                <span className="text-xl font-bold text-white">{activeCount}</span>
                            </div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active</span>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-2 shadow-lg shadow-amber-500/30">
                                <span className="text-xl font-bold text-white">{idleCount}</span>
                            </div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Idle</span>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-2 shadow-lg shadow-blue-500/30">
                                <span className="text-xl font-bold text-white">{totalCount}</span>
                            </div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-xs text-red-600 dark:text-red-400 text-center">Failed to load locations</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Empty state overlay */}
            {!isLoading && (!technicians || technicians.length === 0) && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center max-w-sm border border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-4">
                            <MapIcon className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">No Locations Yet</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Technicians will appear on the map once they share their location through the mobile app.</p>
                    </div>
                </div>
            )}

            <MapContainer
                center={capeTown}
                zoom={12}
                minZoom={3}
                maxZoom={19}
                maxBounds={[[-85, -180], [85, 180]]}
                maxBoundsViscosity={1.0}
                worldCopyJump={false}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
                zoomControl={false}
                scrollWheelZoom={true}
                preferCanvas={true}
            >
                <ZoomControl position="bottomleft" />
                
                {flyToPosition && <FlyToLocation position={flyToPosition} />}
                
                {/* Cached tile layers - all loaded but only active one visible */}
                <CachedTileLayers 
                    activeStyle={mapStyle}
                    onLoadStart={() => setTilesLoading(true)}
                    onLoadEnd={() => setTilesLoading(false)}
                />

                {filteredTechnicians && filteredTechnicians.map((tech) => (
                    <Marker
                        key={tech.id}
                        position={[tech.position.lat, tech.position.lng]}
                        icon={createAnimatedIcon(tech.status, selectedTech?.id === tech.id)}
                        eventHandlers={{
                            click: () => handleSelectTech(tech)
                        }}
                    >
                        <Popup>
                            <EnhancedPopup tech={tech} />
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <style jsx global>{`
                /* Modern tooltip styling */
                .leaflet-tooltip {
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95)) !important;
                    backdrop-filter: blur(10px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 12px !important;
                    color: white !important;
                    padding: 8px 14px !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
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
                
                /* Modern popup styling */
                .leaflet-popup-content-wrapper {
                    border-radius: 16px !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
                    border: none !important;
                    padding: 0 !important;
                    overflow: hidden;
                }
                
                .leaflet-popup-content {
                    margin: 0 !important;
                    min-width: 280px;
                }
                
                .leaflet-popup-tip-container {
                    display: none !important;
                }
                
                .leaflet-popup-close-button {
                    top: 12px !important;
                    right: 12px !important;
                    width: 28px !important;
                    height: 28px !important;
                    background: rgba(255, 255, 255, 0.9) !important;
                    border-radius: 8px !important;
                    font-size: 20px !important;
                    line-height: 26px !important;
                    color: #64748b !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
                    transition: all 0.2s !important;
                    z-index: 10 !important;
                }
                
                .leaflet-popup-close-button:hover {
                    background: white !important;
                    color: #ef4444 !important;
                    transform: scale(1.1) !important;
                }
                
                .leaflet-container {
                    font-family: inherit;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                }
                
                /* Modern zoom controls */
                .leaflet-control-zoom {
                    border: none !important;
                    border-radius: 14px !important;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
                    backdrop-filter: blur(10px) !important;
                }
                
                .leaflet-control-zoom a {
                    width: 40px !important;
                    height: 40px !important;
                    line-height: 40px !important;
                    font-size: 18px !important;
                    border: none !important;
                    background: rgba(255, 255, 255, 0.95) !important;
                    color: #334155 !important;
                    transition: all 0.2s !important;
                }
                
                .leaflet-control-zoom a:hover {
                    background: #f1f5f9 !important;
                    color: #3b82f6 !important;
                }
                
                .leaflet-control-zoom-in {
                    border-radius: 14px 14px 0 0 !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                }
                
                .leaflet-control-zoom-out {
                    border-radius: 0 0 14px 14px !important;
                }
                
                /* Marker animations */
                .selected-marker {
                    z-index: 1000 !important;
                    animation: bounce 0.5s ease-out;
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                /* Responsive adjustments */
                @media (max-width: 640px) {
                    .leaflet-control-zoom a {
                        width: 36px !important;
                        height: 36px !important;
                        line-height: 36px !important;
                        font-size: 16px !important;
                    }
                    
                    .leaflet-popup-content-wrapper {
                        max-width: calc(100vw - 40px) !important;
                    }
                    
                    .leaflet-popup-content {
                        min-width: 260px !important;
                    }
                }
                
                /* Hide attribution */
                .leaflet-control-attribution {
                    display: none !important;
                }
                
                /* Custom scrollbar for list panel */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 6px;
                }
                
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
}
