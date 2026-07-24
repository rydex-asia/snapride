import polyline from "@mapbox/polyline";
import { fetchBackendRoute } from "./platformApi";
const ROUTE_CACHE_TTL_MS = 30_000;
const routeCache = new Map();

export function stripHtml(text = "") {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function decodePolyline(encoded = "") {
  if (!encoded) return [];

  return polyline.decode(encoded).map(([latitude, longitude]) => ({
    latitude,
    longitude,
  }));
}

export function isValidCoordinate(coord) {
  return Number.isFinite(coord?.latitude) && Number.isFinite(coord?.longitude);
}

export function haversineMeters(from, to) {
  if (!isValidCoordinate(from) || !isValidCoordinate(to)) return Infinity;

  const R = 6371000;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(to.latitude - from.latitude);
  const dLng = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearingDegrees(from, to) {
  if (!isValidCoordinate(from) || !isValidCoordinate(to)) return 0;

  const toRad = (value) => (value * Math.PI) / 180;
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const dLng = toRad(to.longitude - from.longitude);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function formatDistanceText(meters = 0) {
  if (!Number.isFinite(meters)) return "";
  if (meters < 1000) {
    return `${Math.max(20, Math.round(meters / 5) * 5)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDurationText(seconds = 0) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}


export function formatMapAddressLabel(value = "", fallback = "Location") {
  const compact = String(value || fallback)
    .replace(/\s+/g, " ")
    .trim();

  if (!compact) return fallback;

  const firstSegment = compact.split(",").map((part) => part.trim()).find(Boolean);
  const label = firstSegment && firstSegment.length >= 4 ? firstSegment : compact;

  if (label.length <= 28) return label;
  return `${label.slice(0, 25).trim()}...`;
}

export function formatArrivalTime(durationSeconds = 0) {
  const arrivalDate = new Date(Date.now() + durationSeconds * 1000);
  return arrivalDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function routeCacheKey(pickupCoord, dropCoord, travelMode) {
  const point = (coord) => `${coord.latitude.toFixed(5)},${coord.longitude.toFixed(5)}`;
  return `${travelMode}:${point(pickupCoord)}:${point(dropCoord)}`;
}

function readCachedRoute(key) {
  const cached = routeCache.get(key);
  if (!cached || Date.now() - cached.createdAt > ROUTE_CACHE_TTL_MS) {
    routeCache.delete(key);
    return null;
  }
  return cached.route;
}

function cacheRoute(key, route) {
  routeCache.set(key, { createdAt: Date.now(), route });
  return route;
}

export function formatInstruction(text = "") {
  return stripHtml(text)
    .replace(/\bonto\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildRouteFallback(pickupCoord, dropCoord) {
  if (!(__DEV__ && process.env.EXPO_PUBLIC_ENABLE_ROUTE_PREVIEW === "true")) return [];
  const origin = pickupCoord || { latitude: 17.3898, longitude: 78.4989 };
  const destination = dropCoord || {
    latitude: origin.latitude + 0.008,
    longitude: origin.longitude + 0.008,
  };

  return [
    origin,
    {
      latitude: origin.latitude + (destination.latitude - origin.latitude) * 0.28,
      longitude: origin.longitude + (destination.longitude - origin.longitude) * 0.2,
    },
    {
      latitude: origin.latitude + (destination.latitude - origin.latitude) * 0.62,
      longitude: origin.longitude + (destination.longitude - origin.longitude) * 0.55,
    },
    destination,
  ];
}

export async function fetchGoogleRoutesApiRoute(
  pickupCoord,
  dropCoord,
  { travelMode = "DRIVE" } = {}
) {
  if (!isValidCoordinate(pickupCoord) || !isValidCoordinate(dropCoord)) {
    throw new Error("Invalid coordinates supplied for Google Routes API");
  }

  const normalizedMode = travelMode === "TWO_WHEELER" ? "TWO_WHEELER" : "DRIVE";
  const cacheKey = routeCacheKey(pickupCoord, dropCoord, normalizedMode);
  const cachedRoute = readCachedRoute(cacheKey);
  if (cachedRoute) return cachedRoute;

  const route = await fetchBackendRoute(pickupCoord, dropCoord, { travelMode: normalizedMode });
  const encodedPolyline = route?.encodedPolyline || "";
  const routeCoords = decodePolyline(encodedPolyline);
  if (routeCoords.length < 2) {
    throw new Error("No route returned from Google Routes API");
  }

  const durationSeconds = route.durationSeconds || 0;
  const steps = route.steps || [];
  return cacheRoute(cacheKey, {
    routeCoords,
    steps,
    distanceText: formatDistanceText(route.distanceMeters || 0),
    durationText: formatDurationText(durationSeconds),
    arrivalText: formatArrivalTime(durationSeconds),
    instructionText: formatInstruction(steps[0]?.navigationInstruction?.instructions || ""),
    nextInstructionText: formatInstruction(steps[1]?.navigationInstruction?.instructions || ""),
    routeProvider: route.provider || "backend-routing",
    travelMode: normalizedMode,
    trafficAware: Boolean(route.trafficAware),
    generatedAt: route.generatedAt,
  });
}

export async function fetchStreetRoute(pickupCoord, dropCoord, options = {}) {
  return fetchGoogleRoutesApiRoute(pickupCoord, dropCoord, options);
}
