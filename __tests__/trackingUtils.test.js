jest.mock("../platformApi", () => ({
  fetchBackendRoute: jest.fn(),
}));

import {
  LIVE_LOCATION_EXPIRED_MS,
  LIVE_LOCATION_STALE_MS,
  MAX_ACCEPTABLE_ACCURACY_M,
  distanceFromRouteMeters,
  normalizeLiveLocation,
  snapLocationToRoute,
} from "../trackingUtils";

describe("live tracking utilities", () => {
  const now = Date.parse("2026-07-23T08:00:00.000Z");

  test("normalizes nested captain payloads and preserves telemetry", () => {
    const result = normalizeLiveLocation(
      {
        data: {
          captainLocation: {
            latitude: 17.401,
            longitude: 78.501,
            heading: "92",
            speed: "8.4",
            accuracy: "12",
            timestamp: now - 1000,
          },
        },
      },
      now
    );

    expect(result).toMatchObject({
      latitude: 17.401,
      longitude: 78.501,
      heading: 92,
      speedMps: 8.4,
      accuracyM: 12,
      ageMs: 1000,
      stale: false,
      expired: false,
    });
  });

  test("marks stale, expired, and inaccurate GPS updates", () => {
    const stale = normalizeLiveLocation(
      { latitude: 17.4, longitude: 78.5, timestamp: now - LIVE_LOCATION_STALE_MS - 1 },
      now
    );
    const expired = normalizeLiveLocation(
      { latitude: 17.4, longitude: 78.5, timestamp: now - LIVE_LOCATION_EXPIRED_MS - 1 },
      now
    );
    const inaccurate = normalizeLiveLocation(
      {
        latitude: 17.4,
        longitude: 78.5,
        timestamp: now,
        accuracy: MAX_ACCEPTABLE_ACCURACY_M + 1,
      },
      now
    );

    expect(stale).toMatchObject({ stale: true, expired: false });
    expect(expired).toMatchObject({ stale: true, expired: true });
    expect(inaccurate.expired).toBe(true);
  });

  test("uses receive time when providers omit timestamps and rejects invalid payloads", () => {
    expect(normalizeLiveLocation({ latitude: 17.4, longitude: 78.5 }, now)).toMatchObject({
      timestamp: now,
      receivedAt: now,
      ageMs: 0,
    });
    expect(normalizeLiveLocation({ latitude: "17.4", longitude: 78.5 }, now)).toBeNull();
    expect(normalizeLiveLocation({}, now)).toBeNull();
  });

  test("measures route proximity and snaps nearby GPS points", () => {
    const route = [
      { latitude: 17.4, longitude: 78.5 },
      { latitude: 17.401, longitude: 78.501 },
      { latitude: 17.402, longitude: 78.502 },
    ];
    const nearby = { latitude: 17.40105, longitude: 78.50105, heading: 40 };
    const snapped = snapLocationToRoute(nearby, route, 20);

    expect(distanceFromRouteMeters(nearby, route)).toBeLessThan(10);
    expect(snapped).toMatchObject({
      latitude: 17.401,
      longitude: 78.501,
      heading: 40,
      snapped: true,
    });
    expect(snapped.snapDistanceM).toBeLessThan(10);
  });

  test("does not snap distant points and handles unusable routes safely", () => {
    const route = [
      { latitude: 17.4, longitude: 78.5 },
      { latitude: 17.401, longitude: 78.501 },
    ];
    const distant = { latitude: 17.5, longitude: 78.6 };

    expect(snapLocationToRoute(distant, route, 70)).toMatchObject({
      ...distant,
      snapped: false,
    });
    expect(distanceFromRouteMeters(distant, [])).toBe(Infinity);
    expect(snapLocationToRoute(distant, [])).toBe(distant);
  });
});
