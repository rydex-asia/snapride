import { haversineMeters, isValidCoordinate } from "./routeUtils";

export const LIVE_LOCATION_STALE_MS = 15000;
export const LIVE_LOCATION_EXPIRED_MS = 60000;
export const MAX_ACCEPTABLE_ACCURACY_M = 200;

export function normalizeLiveLocation(payload = {}, now = Date.now()) {
  const source = payload.location || payload.captainLocation || payload.coords || payload.data?.location || payload.data?.captainLocation || payload.data?.coords || payload;
  if (!isValidCoordinate(source)) return null;
  const rawTimestamp = source.timestamp ?? source.recordedAt ?? source.updatedAt ?? payload.timestamp ?? payload.updatedAt;
  const parsedTimestamp = typeof rawTimestamp === "number" ? rawTimestamp : Date.parse(rawTimestamp || "");
  const timestamp = Number.isFinite(parsedTimestamp) ? parsedTimestamp : now;
  const accuracy = Number(source.accuracy ?? source.accuracyM ?? payload.accuracyM);
  const ageMs = Math.max(0, now - timestamp);
  return {
    latitude: source.latitude,
    longitude: source.longitude,
    heading: Number.isFinite(Number(source.heading)) ? Number(source.heading) : undefined,
    speedMps: Number.isFinite(Number(source.speedMps ?? source.speed)) ? Number(source.speedMps ?? source.speed) : undefined,
    accuracyM: Number.isFinite(accuracy) ? accuracy : undefined,
    timestamp,
    receivedAt: now,
    ageMs,
    stale: ageMs > LIVE_LOCATION_STALE_MS,
    expired: ageMs > LIVE_LOCATION_EXPIRED_MS || (Number.isFinite(accuracy) && accuracy > MAX_ACCEPTABLE_ACCURACY_M),
  };
}

export function distanceFromRouteMeters(point, route = []) {
  if (!isValidCoordinate(point) || !Array.isArray(route) || route.length < 2) return Infinity;
  let minimum = Infinity;
  for (const routePoint of route) {
    minimum = Math.min(minimum, haversineMeters(point, routePoint));
  }
  return minimum;
}

export function snapLocationToRoute(point, route = [], thresholdMeters = 70) {
  if (!isValidCoordinate(point) || !Array.isArray(route) || route.length < 2) return point;
  let nearest = null;
  let distance = Infinity;
  for (const routePoint of route) {
    const nextDistance = haversineMeters(point, routePoint);
    if (nextDistance < distance) { nearest = routePoint; distance = nextDistance; }
  }
  return nearest && distance <= thresholdMeters ? { ...point, latitude: nearest.latitude, longitude: nearest.longitude, snapped: true, snapDistanceM: distance } : { ...point, snapped: false, snapDistanceM: distance };
}
