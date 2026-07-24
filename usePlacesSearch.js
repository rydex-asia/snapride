import { useCallback, useRef } from "react";

const PLACES_AUTOCOMPLETE_LIMIT = 6;
const RECENT_LOCATIONS = [
  "Secunderabad Railway Station Road",
  "Kacheguda Railway Station",
  "HITEC City Metro Station",
  "Jubilee Bus Station",
  "Yashoda Hospitals Hitec City"
];
const DROP_RECENT_SEARCHES = [
  {
    title: "16-2-749/9",
    address: "Karmanghat Rd, SBH Colony, New Malakpet, Hyderabad"
  },
  {
    title: "Secunderabad Railway Station Road",
    address: "Railway Officer Colony, Botiguda, Bhoiguda, Secunderabad"
  },
  {
    title: "13-82",
    address: "Saroornagar, Kodandaram Nagar, Dilsukhnagar, Hyderabad"
  },
  {
    title: "RTA-HYDERABAD",
    address: "Moosarambagh Road, Raidurg, West Prasanth Nagar, Hyderabad"
  },
  {
    title: "Karmanghat Hanuman Temple",
    address: "Inner Ring Road, Virat Nagar, Champapet, Telangana"
  },
  {
    title: "Sharda Apartment",
    address: "30, Moosarambagh, East Prasanth Nagar, Dilsukhnagar"
  },
  {
    title: "Alwal",
    address: "Secunderabad, Telangana, India"
  }
];

const normalizeText = (value) => String(value || "").trim();

const normalizeKind = (value, fallback = "recent") =>
  normalizeText(value || fallback)
    .toLowerCase()
    .replace(/\s+/g, "-");

const getBucket = (item) => {
  const kind = normalizeKind(item?.kind || item?.source || item?.type || "");
  if (kind === "home" || kind === "work" || kind === "saved") return 0;
  if (kind === "recent" || kind === "current-location") return 1;
  if (kind === "popular") return 2;
  if (kind === "google-places" || kind === "prediction" || kind === "api" || kind === "nominatim") return 3;
  return 4;
};

const haversineDistanceKm = (fromCoord, item) => {
  if (!fromCoord || !Number.isFinite(Number(item?.latitude)) || !Number.isFinite(Number(item?.longitude))) {
    return null;
  }
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(Number(item.latitude) - Number(fromCoord.latitude));
  const dLng = toRadians(Number(item.longitude) - Number(fromCoord.longitude));
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(Number(fromCoord.latitude))) *
      Math.cos(toRadians(Number(item.latitude))) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const normalizeRecord = (value, fallbackKind = "recent") => {
  if (!value) return null;
  const title = normalizeText(value.title || value.label || value.mainText || value.description);
  const address = normalizeText(value.address || value.secondaryText || value.subtitle || value.fullLabel || "");
  const placeId = normalizeText(value.placeId || value.place_id || "");
  const latitude = Number(value.latitude ?? value.lat);
  const longitude = Number(value.longitude ?? value.lng);
  const kind = normalizeKind(value.kind || value.source || fallbackKind || "recent");
  if (!title && !address) return null;
  return {
    id: value.id || placeId || `${kind}:${title}:${address}`.toLowerCase(),
    kind,
    title: title || address,
    label: title || address,
    address,
    fullLabel: address ? `${title || address}, ${address}` : title || address,
    placeId: placeId || null,
    place_id: placeId || null,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    description: normalizeText(value.description || ""),
    provider: value.provider || kind,
    distanceMeters: Number.isFinite(Number(value.distanceMeters)) ? Number(value.distanceMeters) : null,
    source: value.source || kind,
    type: value.type || kind,
    addresstype: value.addresstype || kind
  };
};

const dedupeRecords = (records) => {
  const seen = new Set();
  return (records || [])
    .map((item) => normalizeRecord(item))
    .filter(Boolean)
    .filter((item) => {
      const key = [
        item.kind,
        item.placeId || "",
        item.title.toLowerCase(),
        item.address.toLowerCase(),
        item.latitude?.toFixed?.(5) || "",
        item.longitude?.toFixed?.(5) || ""
      ].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const rankRecord = (item, query, referenceCoord) => {
  const normalizedQuery = normalizeText(query).toLowerCase();
  const title = normalizeText(item?.title).toLowerCase();
  const address = normalizeText(item?.address).toLowerCase();
  const bucket = getBucket(item);
  let score = 0;

  if (!normalizedQuery) {
    score += 100 - bucket * 12;
  } else {
    if (title === normalizedQuery || address === normalizedQuery) score += 120;
    if (title.startsWith(normalizedQuery)) score += 70;
    if (address.startsWith(normalizedQuery)) score += 50;
    if (title.includes(normalizedQuery)) score += 30;
    if (address.includes(normalizedQuery)) score += 20;
    score += Math.max(0, 28 - Math.min(title.length, 28));
  }

  score += Math.max(0, 30 - bucket * 8);

  const distanceKm = haversineDistanceKm(referenceCoord, item);
  if (Number.isFinite(distanceKm)) {
    score += Math.max(0, 24 - Math.min(distanceKm, 24));
  }

  if (Number.isFinite(Number(item?.distanceMeters))) {
    score += Math.max(0, 18 - Math.min(Number(item.distanceMeters) / 1000, 18));
  }

  return score;
};

const mergeRecordGroups = (groups, query, referenceCoord, limit = PLACES_AUTOCOMPLETE_LIMIT) => {
  const merged = dedupeRecords(groups.flat());
  return merged
    .sort((left, right) => rankRecord(right, query, referenceCoord) - rankRecord(left, query, referenceCoord))
    .slice(0, limit);
};

const getLocalSearchFallbacks = (query) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery || normalizedQuery.length < 2) {
    return [];
  }
  const entries = [
    ...DROP_RECENT_SEARCHES.map((item) => ({
      title: item.title,
      label: item.title,
      address: item.address,
      fullLabel: `${item.title}, ${item.address}`,
      kind: "recent",
      source: "recent"
    })),
    ...RECENT_LOCATIONS.map((item) => ({
      title: item,
      label: item,
      address: "Recent destination",
      fullLabel: item,
      kind: "recent",
      source: "recent"
    }))
  ];

  return entries
    .map((item) => ({
      ...item,
      score:
        (item.fullLabel || "")
          .toLowerCase()
          .includes(normalizedQuery.toLowerCase())
          ? normalizedQuery.length * 10
          : 0
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map(({ score, ...item }) => item);
};

const buildFallbackRecords = ({ query, savedPlaces, recentSearches, recentBookedDrops, referenceCoord, limit }) => {
  const normalizedQuery = normalizeText(query).toLowerCase();
  const records = dedupeRecords([
    ...(referenceCoord
      ? [
          {
            title: "Use current location",
            address: "Locate pickup or drop with GPS",
            kind: "current-location",
            source: "current-location",
            latitude: referenceCoord.latitude,
            longitude: referenceCoord.longitude
          }
        ]
      : []),
    ...(savedPlaces || []),
    ...(recentSearches || []),
    ...(recentBookedDrops || []).map((item) => ({
      title: item,
      address: "Recent destination",
      kind: "recent",
      source: "recent"
    })),
    ...RECENT_LOCATIONS.map((item) => ({
      title: item,
      address: "Popular destination",
      kind: "popular",
      source: "popular"
    })),
    ...DROP_RECENT_SEARCHES.map((item) => ({
      title: item.title,
      address: item.address,
      kind: "popular",
      source: "popular"
    })),
    ...getLocalSearchFallbacks(normalizedQuery)
  ]);

  if (records.length <= limit) {
    return records.slice(0, limit);
  }

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return records.slice(0, limit);
  }

  const queryMatches = records.filter((item) => {
    const haystack = `${item.title} ${item.address}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  return (queryMatches.length ? queryMatches : records).slice(0, limit);
};

export function usePlacesSearch({
  apiFetch,
  currentCoord,
  pickupCoord,
  savedPlaces = [],
  recentSearches = [],
  recentBookedDrops = [],
  uiMode,
  defaultScope = "address"
}) {
  const cacheRef = useRef(new Map());
  const sessionTokenRef = useRef(new Map());
  const abortRef = useRef({ home: null, address: null });

  const getSessionToken = useCallback((scope) => {
    const key = scope || defaultScope;
    if (!sessionTokenRef.current.has(key)) {
      const token =
        typeof globalThis?.crypto?.randomUUID === "function"
          ? globalThis.crypto.randomUUID()
          : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionTokenRef.current.set(key, token);
    }
    return sessionTokenRef.current.get(key);
  }, [defaultScope]);

  const resetSearchSessionToken = useCallback((scope) => {
    const key = scope || defaultScope;
    sessionTokenRef.current.delete(key);
  }, [defaultScope]);

  const clearSearchCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const searchPlaces = useCallback(
    async (query, options = {}) => {
      const normalizedQuery = normalizeText(query);
      console.log("QUERY:", normalizedQuery);
      const scope = options.scope || defaultScope || (uiMode === "home" ? "home" : "address");
      const referenceCoord =
        options.referenceCoord ||
        (scope === "home" ? currentCoord || pickupCoord || null : pickupCoord || currentCoord || null);
      const locationKey = referenceCoord
        ? `${Number(referenceCoord.latitude).toFixed(3)}:${Number(referenceCoord.longitude).toFixed(3)}`
        : "noloc";
      const cacheKey = `${scope}|${normalizedQuery.toLowerCase()}|${locationKey}`;
      if (cacheRef.current.has(cacheKey)) {
        return cacheRef.current.get(cacheKey);
      }

      const fallbackRecords = buildFallbackRecords({
        query: normalizedQuery,
        savedPlaces,
        recentSearches,
        recentBookedDrops,
        referenceCoord,
        limit: PLACES_AUTOCOMPLETE_LIMIT
      });

      const mergeSearchResults = (...groups) =>
        mergeRecordGroups(groups, normalizedQuery, referenceCoord, PLACES_AUTOCOMPLETE_LIMIT).map((item) => ({
          ...item,
          fullLabel: item.address ? `${item.title}, ${item.address}` : item.title
        }));

      if (!normalizedQuery || normalizedQuery.length < 2) {
        const results = mergeSearchResults(fallbackRecords);
        cacheRef.current.set(cacheKey, results);
        return results;
      }

      const previousAbort = abortRef.current?.[scope];
      previousAbort?.abort?.();
      const controller = new AbortController();
      abortRef.current[scope] = controller;

      const sessionToken = getSessionToken(scope);
      const locationParams = referenceCoord
        ? `&lat=${encodeURIComponent(referenceCoord.latitude)}&lng=${encodeURIComponent(referenceCoord.longitude)}`
        : "";

      try {
        const response = await apiFetch(
          `/maps/search?q=${encodeURIComponent(normalizedQuery)}${locationParams}&sessionToken=${encodeURIComponent(sessionToken)}`,
          { signal: controller.signal }
        );
        const data = response.ok ? await response.json() : [];
        console.log("API RESPONSE:", data);
        const apiResults = Array.isArray(data?.predictions)
          ? data.predictions.map((item) =>
              normalizeRecord(
                {
                  id: item.place_id,
                  title: item.structured_formatting?.main_text,
                  address: item.structured_formatting?.secondary_text,
                  description: item.description,
                  placeId: item.place_id,
                  source: item.provider || "google-places",
                  kind: "google-places",
                  provider: item.provider || "google-places"
                },
                "google-places"
              )
            )
          : [];

        if (!apiResults.length) {
          console.warn("Autocomplete returned no predictions for:", normalizedQuery);
        }

        const results = apiResults.length
          ? dedupeRecords([...apiResults, ...fallbackRecords])
              .slice(0, PLACES_AUTOCOMPLETE_LIMIT)
              .map((item) => ({
                ...item,
                fullLabel: item.address ? `${item.title}, ${item.address}` : item.title
              }))
          : mergeSearchResults(fallbackRecords);
        cacheRef.current.set(cacheKey, results);
        resetSearchSessionToken(scope);
        return results;
      } catch (error) {
        if (error?.name === "AbortError") {
          return cacheRef.current.get(cacheKey) || mergeSearchResults(fallbackRecords);
        }

        console.warn("Autocomplete error:", error?.message || error);
        let nominatimResponse = [];
        try {
          const url = new URL("https://nominatim.openstreetmap.org/search");
          url.searchParams.set("format", "jsonv2");
          url.searchParams.set("addressdetails", "1");
          url.searchParams.set("limit", "8");
          url.searchParams.set("countrycodes", "in");
          url.searchParams.set("q", normalizedQuery);
          if (referenceCoord) {
            const delta = 0.22;
            url.searchParams.set(
              "viewbox",
              `${Number(referenceCoord.longitude) - delta},${Number(referenceCoord.latitude) + delta},${Number(referenceCoord.longitude) + delta},${Number(referenceCoord.latitude) - delta}`
            );
          }
          const nominatim = await fetch(url.toString(), { headers: { "accept-language": "en" } });
          if (nominatim.ok) {
            const nominatimData = await nominatim.json();
            nominatimResponse = Array.isArray(nominatimData)
              ? nominatimData.map((item) =>
                  normalizeRecord(
                    {
                      latitude: Number(item.lat),
                      longitude: Number(item.lon),
                      title: item.display_name,
                      address: item.display_name,
                      source: "nominatim",
                      kind: "nominatim",
                      provider: "nominatim"
                    },
                    "nominatim"
                  )
                )
              : [];
          }
        } catch (nominatimError) {
          console.warn("Nominatim fallback error:", nominatimError?.message || nominatimError);
        }

        const results = nominatimResponse.length
          ? dedupeRecords([...nominatimResponse, ...fallbackRecords])
              .slice(0, PLACES_AUTOCOMPLETE_LIMIT)
              .map((item) => ({
                ...item,
                fullLabel: item.address ? `${item.title}, ${item.address}` : item.title
              }))
          : mergeSearchResults(fallbackRecords);
        cacheRef.current.set(cacheKey, results);
        if (!results.length) {
          console.warn("Autocomplete and fallback returned no results for:", normalizedQuery);
        }
        return results;
      } finally {
        if (abortRef.current[scope] === controller) {
          abortRef.current[scope] = null;
        }
      }
    },
    [apiFetch, currentCoord, pickupCoord, recentBookedDrops, recentSearches, savedPlaces, defaultScope, getSessionToken, resetSearchSessionToken, uiMode]
  );

  return {
    searchPlaces,
    resetSearchSessionToken,
    clearSearchCache,
    buildFallbackResults: (query, options = {}) =>
      buildFallbackRecords({
        query,
        savedPlaces,
        recentSearches,
        recentBookedDrops,
        referenceCoord: options.referenceCoord || null,
        limit: options.limit || PLACES_AUTOCOMPLETE_LIMIT
      })
  };
}
