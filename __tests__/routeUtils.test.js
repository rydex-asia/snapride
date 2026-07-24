jest.mock("../platformApi", () => ({
  fetchBackendRoute: jest.fn(),
}));

import { fetchBackendRoute } from "../platformApi";
import {
  bearingDegrees,
  buildRouteFallback,
  decodePolyline,
  fetchGoogleRoutesApiRoute,
  formatDistanceText,
  formatDurationText,
  formatInstruction,
  formatMapAddressLabel,
  haversineMeters,
  isValidCoordinate,
  stripHtml,
} from "../routeUtils";

describe("route utilities", () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.EXPO_PUBLIC_ENABLE_ROUTE_PREVIEW;
  });

  test("validates finite latitude and longitude values", () => {
    expect(isValidCoordinate({ latitude: 17.4, longitude: 78.5 })).toBe(true);
    expect(isValidCoordinate({ latitude: Number.NaN, longitude: 78.5 })).toBe(false);
    expect(isValidCoordinate({ latitude: 17.4 })).toBe(false);
    expect(isValidCoordinate(null)).toBe(false);
  });

  test("calculates distance and cardinal bearing", () => {
    const origin = { latitude: 0, longitude: 0 };
    const north = { latitude: 0.001, longitude: 0 };
    const east = { latitude: 0, longitude: 0.001 };

    expect(haversineMeters(origin, north)).toBeCloseTo(111.19, 0);
    expect(bearingDegrees(origin, north)).toBeCloseTo(0, 4);
    expect(bearingDegrees(origin, east)).toBeCloseTo(90, 4);
    expect(haversineMeters(origin, null)).toBe(Infinity);
  });

  test("decodes Google encoded polylines into map coordinates", () => {
    expect(decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@")).toEqual([
      { latitude: 38.5, longitude: -120.2 },
      { latitude: 40.7, longitude: -120.95 },
      { latitude: 43.252, longitude: -126.453 },
    ]);
    expect(decodePolyline()).toEqual([]);
  });

  test("formats map labels, distances, durations, and instructions", () => {
    expect(formatDistanceText(742)).toBe("740 m");
    expect(formatDistanceText(1480)).toBe("1.5 km");
    expect(formatDurationText(59)).toBe("1 min");
    expect(formatDurationText(3900)).toBe("1 hr 5 min");
    expect(formatMapAddressLabel("  Kacheguda Railway Station, Hyderabad ")).toBe(
      "Kacheguda Railway Station"
    );
    expect(formatMapAddressLabel("A very long destination label exceeding the limit")).toBe(
      "A very long destination l..."
    );
    expect(stripHtml("<b>Turn left</b> & continue")).toBe("Turn left & continue");
    expect(formatInstruction("<b>Turn</b> onto Main Road")).toBe("Turn Main Road");
  });

  test("keeps synthetic route previews disabled unless explicitly enabled in development", () => {
    const origin = { latitude: 17.39, longitude: 78.49 };
    const destination = { latitude: 17.41, longitude: 78.52 };

    expect(buildRouteFallback(origin, destination)).toEqual([]);

    process.env.EXPO_PUBLIC_ENABLE_ROUTE_PREVIEW = "true";
    const preview = buildRouteFallback(origin, destination);
    expect(preview).toHaveLength(4);
    expect(preview[0]).toBe(origin);
    expect(preview[3]).toBe(destination);
  });

  test("normalizes backend routes and caches identical requests", async () => {
    fetchBackendRoute.mockResolvedValue({
      encodedPolyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@",
      distanceMeters: 1480,
      durationSeconds: 390,
      steps: [
        { navigationInstruction: { instructions: "<b>Head</b> onto Main Road" } },
        { navigationInstruction: { instructions: "Turn right" } },
      ],
      provider: "google-routes",
      trafficAware: true,
      generatedAt: "2026-07-23T07:00:00.000Z",
    });

    const origin = { latitude: 17.40001, longitude: 78.50001 };
    const destination = { latitude: 17.42001, longitude: 78.53001 };
    const first = await fetchGoogleRoutesApiRoute(origin, destination, {
      travelMode: "TWO_WHEELER",
    });
    const second = await fetchGoogleRoutesApiRoute(origin, destination, {
      travelMode: "TWO_WHEELER",
    });

    expect(fetchBackendRoute).toHaveBeenCalledTimes(1);
    expect(fetchBackendRoute).toHaveBeenCalledWith(origin, destination, {
      travelMode: "TWO_WHEELER",
    });
    expect(second).toBe(first);
    expect(first).toMatchObject({
      distanceText: "1.5 km",
      durationText: "7 min",
      instructionText: "Head Main Road",
      nextInstructionText: "Turn right",
      routeProvider: "google-routes",
      travelMode: "TWO_WHEELER",
      trafficAware: true,
    });
    expect(first.routeCoords).toHaveLength(3);
  });

  test("rejects invalid coordinates and empty backend routes", async () => {
    await expect(fetchGoogleRoutesApiRoute(null, { latitude: 1, longitude: 1 })).rejects.toThrow(
      "Invalid coordinates"
    );

    fetchBackendRoute.mockResolvedValueOnce({ encodedPolyline: "" });
    await expect(
      fetchGoogleRoutesApiRoute(
        { latitude: 18.11111, longitude: 79.11111 },
        { latitude: 18.22222, longitude: 79.22222 }
      )
    ).rejects.toThrow("No route returned");
  });
});
